import { describe, expect, test } from "bun:test";
import { assertRateLimit } from "../rate-limit";

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

describe("rate limit helper", () => {
  test("rejects requests after the configured limit", async () => {
    const store = new MemoryRateLimitStore();
    const input = {
      key: "upload:admin:1",
      limit: 2,
      store,
      windowSeconds: 60
    };

    await expect(assertRateLimit(input)).resolves.toEqual({ count: 1, remaining: 1 });
    await expect(assertRateLimit(input)).resolves.toEqual({ count: 2, remaining: 0 });
    await expect(assertRateLimit(input)).rejects.toThrow("Terlalu banyak percobaan");
  });
});
