import { eq } from "drizzle-orm";
import { db } from "./db";
import { redis } from "./db/redis";
import { user } from "./db/schema";
import { env } from "./env";
import {
  assertVerificationEmailSendAllowed,
  EMAIL_VERIFICATION_LIMIT_MESSAGE,
  markVerificationEmailRateLimitChecked,
  type VerificationEmailPurpose
} from "./email/verification";
import { getRequestIp } from "./request-ip";

type AuthUserForRateLimit = {
  id: string;
  emailVerified: boolean;
};

type RateLimitTarget = {
  email: string;
  purpose: VerificationEmailPurpose;
};

type PreflightOptions = {
  findUserByEmail?: (email: string) => Promise<AuthUserForRateLimit | null | undefined>;
  limit?: number;
  windowSeconds?: number;
  store?: {
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
  };
};

async function defaultFindUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: eq(user.email, email),
    columns: {
      id: true,
      emailVerified: true
    }
  });
}

async function readAuthBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.clone().json().catch(() => null);
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(await request.clone().text()));
  }

  return null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function resolveVerificationEmailRateLimitTarget(
  request: Request,
  findUserByEmail: (email: string) => Promise<AuthUserForRateLimit | null | undefined> = defaultFindUserByEmail
): Promise<RateLimitTarget | null> {
  if (request.method !== "POST") return null;

  const pathname = new URL(request.url).pathname;
  const body = await readAuthBody(request);
  if (!body) return null;

  if (pathname === "/api/auth/change-email") {
    const email = stringValue(body.newEmail);
    return email ? { email, purpose: "change-email" } : null;
  }

  const email = stringValue(body.email);
  if (!email) return null;

  if (pathname === "/api/auth/sign-up/email") {
    const existingUser = await findUserByEmail(email);
    return existingUser ? null : { email, purpose: "email-verification" };
  }

  if (pathname === "/api/auth/sign-in/email" || pathname === "/api/auth/send-verification-email") {
    const existingUser = await findUserByEmail(email);
    return existingUser && !existingUser.emailVerified ? { email, purpose: "email-verification" } : null;
  }

  return null;
}

export async function preflightVerificationEmailRateLimit(request: Request, options: PreflightOptions = {}) {
  const target = await resolveVerificationEmailRateLimitTarget(request, options.findUserByEmail ?? defaultFindUserByEmail);
  if (!target) return request;

  await assertVerificationEmailSendAllowed({
    email: target.email,
    ip: getRequestIp(request),
    limit: options.limit ?? env.EMAIL_VERIFICATION_LIMIT,
    purpose: target.purpose,
    store: options.store ?? redis,
    windowSeconds: options.windowSeconds ?? env.EMAIL_VERIFICATION_WINDOW_SECONDS
  });

  return markVerificationEmailRateLimitChecked(request, target);
}

export function isVerificationEmailRateLimitError(error: unknown) {
  return (
    error instanceof Error &&
    "body" in error &&
    (error as { body?: { code?: string } }).body?.code === "EMAIL_VERIFICATION_RATE_LIMITED"
  );
}

export function verificationEmailRateLimitPayload() {
  return {
    code: "EMAIL_VERIFICATION_RATE_LIMITED",
    message: EMAIL_VERIFICATION_LIMIT_MESSAGE
  };
}
