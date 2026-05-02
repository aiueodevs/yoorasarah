import { describe, expect, test } from "bun:test";
import { isAllowedStoragePublicUrl, parseCorsOrigins, parseEnv, parseStoragePublicOrigins } from "../env";

describe("env helpers", () => {
  test("cleans accidental duplicated CORS_ORIGIN assignment prefixes", () => {
    expect(parseCorsOrigins("CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000")).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ]);
  });

  test("rejects insecure production defaults", () => {
    expect(() => parseEnv({
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: "local-development-secret-change-before-production",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "change-this-password",
      RESEND_API_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: ""
    })).toThrow("Production env is not secure");
  });

  test("parses storage origins and accepts wildcard supabase hosts", () => {
    const origins = parseStoragePublicOrigins("https://*.supabase.co,https://yoorasarah-products.fly.storage.tigris.dev");
    expect(isAllowedStoragePublicUrl("https://abc.supabase.co/storage/v1/object/public/product-images/x.jpg", origins)).toBe(true);
    expect(isAllowedStoragePublicUrl("https://yoorasarah-products.fly.storage.tigris.dev/products/x.jpg", origins)).toBe(true);
    expect(isAllowedStoragePublicUrl("https://evil.example/x.jpg", origins)).toBe(false);
  });
});
