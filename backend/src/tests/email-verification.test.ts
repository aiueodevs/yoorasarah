import { describe, expect, test } from "bun:test";
import {
  EMAIL_VERIFICATION_LIMIT_MESSAGE,
  assertVerificationEmailSendAllowed,
  buildVerificationEmailRateLimitKey,
  isVerificationEmailRateLimitChecked,
  markVerificationEmailRateLimitChecked,
  resolvePublicVerificationUrl,
  sendResendVerificationEmail
} from "../email/verification";

class MemoryRateLimitStore {
  values = new Map<string, number>();
  expirations = new Map<string, number>();

  async incr(key: string) {
    const next = (this.values.get(key) ?? 0) + 1;
    this.values.set(key, next);
    return next;
  }

  async expire(key: string, seconds: number) {
    this.expirations.set(key, seconds);
    return 1;
  }
}

describe("email verification sender", () => {
  test("builds stable hashed rate limit keys without leaking email or IP", () => {
    const first = buildVerificationEmailRateLimitKey({
      email: " USER@EXAMPLE.COM ",
      ip: "127.0.0.1",
      purpose: "email-verification"
    });
    const second = buildVerificationEmailRateLimitKey({
      email: "user@example.com",
      ip: "127.0.0.1",
      purpose: "email-verification"
    });

    expect(first).toBe(second);
    expect(first).toStartWith("email:verification:");
    expect(first).not.toContain("user@example.com");
    expect(first).not.toContain("127.0.0.1");
  });

  test("allows three verification emails per window and rejects the fourth", async () => {
    const store = new MemoryRateLimitStore();
    const input = {
      email: "user@example.com",
      ip: "127.0.0.1",
      limit: 3,
      purpose: "email-verification" as const,
      store,
      windowSeconds: 900
    };

    await expect(assertVerificationEmailSendAllowed(input)).resolves.toEqual({ count: 1, remaining: 2 });
    await expect(assertVerificationEmailSendAllowed(input)).resolves.toEqual({ count: 2, remaining: 1 });
    await expect(assertVerificationEmailSendAllowed(input)).resolves.toEqual({ count: 3, remaining: 0 });
    await expect(assertVerificationEmailSendAllowed(input)).rejects.toThrow(EMAIL_VERIFICATION_LIMIT_MESSAGE);
    expect(store.expirations.get(buildVerificationEmailRateLimitKey(input))).toBe(900);
  });

  test("keeps rate limits separate by email, purpose, and IP", async () => {
    const store = new MemoryRateLimitStore();
    const base = {
      email: "user@example.com",
      ip: "127.0.0.1",
      limit: 1,
      purpose: "email-verification" as const,
      store,
      windowSeconds: 900
    };

    await assertVerificationEmailSendAllowed(base);
    await expect(assertVerificationEmailSendAllowed(base)).rejects.toThrow(EMAIL_VERIFICATION_LIMIT_MESSAGE);
    await expect(assertVerificationEmailSendAllowed({ ...base, email: "other@example.com" })).resolves.toEqual({ count: 1, remaining: 0 });
    await expect(assertVerificationEmailSendAllowed({ ...base, purpose: "change-email" })).resolves.toEqual({ count: 1, remaining: 0 });
    await expect(assertVerificationEmailSendAllowed({ ...base, ip: "192.168.0.1" })).resolves.toEqual({ count: 1, remaining: 0 });
  });

  test("sends verification email through Resend with text and html bodies", async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const response = await sendResendVerificationEmail({
      apiKey: "resend-key",
      fetcher: async (url, init) => {
        requests.push({ url: String(url), init: init ?? {} });
        return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
      },
      from: "Yoora Sarah <noreply@example.com>",
      to: "user@example.com",
      url: "https://api.example.com/api/auth/verify-email?token=abc"
    });

    expect(response).toEqual({ id: "email-id" });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://api.resend.com/emails");
    expect(requests[0].init.method).toBe("POST");
    expect(requests[0].init.headers).toEqual({
      Authorization: "Bearer resend-key",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(requests[0].init.body))).toMatchObject({
      from: "Yoora Sarah <noreply@example.com>",
      to: "user@example.com",
      subject: "Verifikasi email Yoora Sarah"
    });
    expect(JSON.parse(String(requests[0].init.body)).text).toContain("https://api.example.com/api/auth/verify-email?token=abc");
    expect(JSON.parse(String(requests[0].init.body)).html).toContain("Verifikasi Email");
  });

  test("rewrites relative verification callback URLs to the trusted frontend origin", () => {
    const url = resolvePublicVerificationUrl(
      "http://localhost:4000/api/auth/verify-email?token=abc&callbackURL=%2Fprofile",
      new Request("http://localhost:4000/api/auth/sign-up/email", {
        headers: { origin: "http://localhost:3000" }
      }),
      ["http://localhost:3000"]
    );

    expect(url).toBe("http://localhost:4000/api/auth/verify-email?token=abc&callbackURL=http%3A%2F%2Flocalhost%3A3000%2Fprofile");
  });

  test("marks requests that already passed verification email rate limiting", () => {
    const request = new Request("http://localhost:4000/api/auth/send-verification-email", {
      headers: { "x-forwarded-for": "127.0.0.1" }
    });

    const marked = markVerificationEmailRateLimitChecked(request, {
      email: "user@example.com",
      purpose: "email-verification"
    });

    expect(isVerificationEmailRateLimitChecked(marked, {
      email: "user@example.com",
      purpose: "email-verification"
    })).toBe(true);
    expect(isVerificationEmailRateLimitChecked(marked, {
      email: "other@example.com",
      purpose: "email-verification"
    })).toBe(false);
  });
});
