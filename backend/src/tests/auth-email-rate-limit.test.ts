import { describe, expect, test } from "bun:test";
import {
  preflightVerificationEmailRateLimit,
  resolveVerificationEmailRateLimitTarget
} from "../auth-email-rate-limit";
import { isVerificationEmailRateLimitChecked } from "../email/verification";

class MemoryRateLimitStore {
  values = new Map<string, number>();

  async incr(key: string) {
    const next = (this.values.get(key) ?? 0) + 1;
    this.values.set(key, next);
    return next;
  }

  async expire() {
    return 1;
  }
}

describe("auth email rate limit preflight", () => {
  test("targets new sign-ups and skips existing users", async () => {
    const request = new Request("http://localhost:4000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "new@example.com" })
    });

    await expect(resolveVerificationEmailRateLimitTarget(request, async () => null)).resolves.toEqual({
      email: "new@example.com",
      purpose: "email-verification"
    });
    await expect(resolveVerificationEmailRateLimitTarget(request, async () => ({ id: "user-1", emailVerified: false }))).resolves.toBeNull();
  });

  test("targets unverified login and resend verification requests", async () => {
    const request = new Request("http://localhost:4000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" })
    });

    await expect(resolveVerificationEmailRateLimitTarget(request, async () => ({ id: "user-1", emailVerified: false }))).resolves.toEqual({
      email: "user@example.com",
      purpose: "email-verification"
    });
    await expect(resolveVerificationEmailRateLimitTarget(request, async () => ({ id: "user-1", emailVerified: true }))).resolves.toBeNull();
  });

  test("returns a marked request after the email send is counted", async () => {
    const request = new Request("http://localhost:4000/api/auth/send-verification-email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1"
      },
      body: JSON.stringify({ email: "user@example.com" })
    });

    const marked = await preflightVerificationEmailRateLimit(request, {
      findUserByEmail: async () => ({ id: "user-1", emailVerified: false }),
      limit: 1,
      store: new MemoryRateLimitStore(),
      windowSeconds: 900
    });

    expect(isVerificationEmailRateLimitChecked(marked, {
      email: "user@example.com",
      purpose: "email-verification"
    })).toBe(true);
  });

  test("rejects the fourth matching verification email request", async () => {
    const store = new MemoryRateLimitStore();
    const request = () => new Request("http://localhost:4000/api/auth/send-verification-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" })
    });
    const options = {
      findUserByEmail: async () => ({ id: "user-1", emailVerified: false }),
      limit: 3,
      store,
      windowSeconds: 900
    };

    await preflightVerificationEmailRateLimit(request(), options);
    await preflightVerificationEmailRateLimit(request(), options);
    await preflightVerificationEmailRateLimit(request(), options);
    await expect(preflightVerificationEmailRateLimit(request(), options)).rejects.toThrow("Terlalu sering mengirim email verifikasi");
  });
});
