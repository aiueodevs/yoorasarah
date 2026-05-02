import { createHash } from "node:crypto";
import { APIError } from "better-auth";
import { redis } from "../db/redis";
import { corsOrigins, env } from "../env";
import { getRequestIp } from "../request-ip";

export const EMAIL_VERIFICATION_LIMIT_MESSAGE = "Terlalu sering mengirim email verifikasi. Coba lagi beberapa menit lagi.";
export const VERIFICATION_EMAIL_RATE_LIMIT_HEADER = "x-ys-email-rate-limit-key";

export type VerificationEmailPurpose = "email-verification" | "change-email";

type RateLimitStore = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
};

type RateLimitInput = {
  email: string;
  ip?: string | null;
  limit: number;
  purpose: VerificationEmailPurpose;
  store: RateLimitStore;
  windowSeconds: number;
};

type BetterAuthVerificationEmailData = {
  user: {
    email: string;
    name?: string | null;
  };
  url: string;
  token: string;
};

type ResendVerificationEmailInput = {
  apiKey?: string;
  fetcher?: (url: string, init?: RequestInit) => Promise<Response>;
  from?: string;
  to: string;
  url: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeIp(ip?: string | null) {
  const firstForwardedIp = ip?.split(",")[0]?.trim();
  return firstForwardedIp || "unknown";
}

export function buildVerificationEmailRateLimitKey({ email, ip, purpose }: Pick<RateLimitInput, "email" | "ip" | "purpose">) {
  const digest = createHash("sha256")
    .update(`${normalizeEmail(email)}|${purpose}|${normalizeIp(ip)}`)
    .digest("hex");

  return `email:verification:${purpose}:${digest}`;
}

function buildRequestVerificationEmailRateLimitKey(request: Request | undefined, email: string, purpose: VerificationEmailPurpose) {
  return buildVerificationEmailRateLimitKey({
    email,
    ip: getRequestIp(request),
    purpose
  });
}

export function markVerificationEmailRateLimitChecked(request: Request, input: { email: string; purpose: VerificationEmailPurpose }) {
  const headers = new Headers(request.headers);
  headers.set(VERIFICATION_EMAIL_RATE_LIMIT_HEADER, buildRequestVerificationEmailRateLimitKey(request, input.email, input.purpose));
  return new Request(request, { headers });
}

export function isVerificationEmailRateLimitChecked(request: Request | undefined, input: { email: string; purpose: VerificationEmailPurpose }) {
  return request?.headers.get(VERIFICATION_EMAIL_RATE_LIMIT_HEADER) === buildRequestVerificationEmailRateLimitKey(request, input.email, input.purpose);
}

export async function assertVerificationEmailSendAllowed(input: RateLimitInput) {
  const key = buildVerificationEmailRateLimitKey(input);
  const count = await input.store.incr(key);

  if (count === 1) {
    await input.store.expire(key, input.windowSeconds);
  }

  if (count > input.limit) {
    throw new APIError("TOO_MANY_REQUESTS", {
      code: "EMAIL_VERIFICATION_RATE_LIMITED",
      message: EMAIL_VERIFICATION_LIMIT_MESSAGE
    });
  }

  return {
    count,
    remaining: Math.max(input.limit - count, 0)
  };
}

export async function sendResendVerificationEmail({
  apiKey,
  fetcher = fetch,
  from,
  to,
  url
}: ResendVerificationEmailInput) {
  if (!apiKey) {
    throw new APIError("INTERNAL_SERVER_ERROR", { message: "RESEND_API_KEY belum diset." });
  }

  if (!from) {
    throw new APIError("INTERNAL_SERVER_ERROR", { message: "EMAIL_FROM belum diset." });
  }

  const body = {
    from,
    to: normalizeEmail(to),
    subject: "Verifikasi email Yoora Sarah",
    text: [
      "Verifikasi Email Yoora Sarah",
      "",
      "Klik link berikut untuk memverifikasi email akun Anda:",
      url,
      "",
      "Jika Anda tidak meminta email ini, abaikan pesan ini."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#51403A">
        <h1 style="font-size:22px;margin:0 0 12px">Verifikasi Email</h1>
        <p>Klik tombol di bawah untuk memverifikasi email akun Yoora Sarah Anda.</p>
        <p>
          <a href="${url}" style="display:inline-block;background:#51403A;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
            Verifikasi Email
          </a>
        </p>
        <p style="font-size:13px;color:#7d675f">Jika tombol tidak bekerja, buka link ini:<br>${url}</p>
      </div>
    `.trim()
  };

  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const responseText = await response.text();
  const payload = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    throw new APIError("BAD_REQUEST", {
      message: payload?.message ?? "Gagal mengirim email verifikasi melalui Resend."
    });
  }

  return payload;
}

function decodeTokenPayload(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      requestType?: string;
      updateTo?: string;
    };
  } catch {
    return null;
  }
}

export function resolveVerificationEmailPurpose(url: string): VerificationEmailPurpose {
  try {
    const token = new URL(url).searchParams.get("token");
    const payload = token ? decodeTokenPayload(token) : null;

    if (payload?.updateTo || payload?.requestType?.startsWith("change-email")) {
      return "change-email";
    }
  } catch {
    return "email-verification";
  }

  return "email-verification";
}

function requestFrontendOrigin(request?: Request) {
  const origin = request?.headers.get("origin");
  if (origin) return origin;

  const referer = request?.headers.get("referer");
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function resolvePublicVerificationUrl(url: string, request?: Request, trustedOrigins = corsOrigins) {
  const frontendOrigin = requestFrontendOrigin(request);
  if (!frontendOrigin || !trustedOrigins.includes(frontendOrigin)) return url;

  const verificationUrl = new URL(url);
  const callbackURL = verificationUrl.searchParams.get("callbackURL");
  if (!callbackURL?.startsWith("/")) return url;

  verificationUrl.searchParams.set("callbackURL", `${frontendOrigin}${callbackURL}`);
  return verificationUrl.toString();
}

export async function sendBetterAuthVerificationEmail(data: BetterAuthVerificationEmailData, request?: Request) {
  const purpose = resolveVerificationEmailPurpose(data.url);

  if (!isVerificationEmailRateLimitChecked(request, { email: data.user.email, purpose })) {
    await assertVerificationEmailSendAllowed({
      email: data.user.email,
      ip: getRequestIp(request),
      limit: env.EMAIL_VERIFICATION_LIMIT,
      purpose,
      store: redis,
      windowSeconds: env.EMAIL_VERIFICATION_WINDOW_SECONDS
    });
  }

  await sendResendVerificationEmail({
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
    to: data.user.email,
    url: resolvePublicVerificationUrl(data.url, request)
  });
}
