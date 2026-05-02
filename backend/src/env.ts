import { z } from "zod";

const DEFAULT_AUTH_SECRET = "local-development-secret-change-before-production";
const DEFAULT_ADMIN_PASSWORD = "change-this-password";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgresql://yoorasarah:yoorasarah@localhost:5432/yoorasarah"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  BETTER_AUTH_SECRET: z.string().default(DEFAULT_AUTH_SECRET),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Yoora Sarah <noreply@yoorasarah.com>"),
  EMAIL_VERIFICATION_LIMIT: z.coerce.number().int().positive().default(3),
  EMAIL_VERIFICATION_WINDOW_SECONDS: z.coerce.number().int().positive().default(900),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("product-images"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  TRUST_PROXY: z.coerce.boolean().default(false),
  STORAGE_PUBLIC_ORIGINS: z.string().default("https://*.supabase.co,https://yoorasarah-products.fly.storage.tigris.dev"),
  ADMIN_EMAIL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().email().optional()
  ).transform((value) => value ?? "admin@yoorasarah.local"),
  ADMIN_PASSWORD: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(8).optional()
  ).transform((value) => value ?? DEFAULT_ADMIN_PASSWORD)
});

export type AppEnv = z.infer<typeof envSchema>;

function normalizeOptional(value: string | undefined) {
  return value?.trim() || undefined;
}

export function validateProductionEnv(config: AppEnv) {
  if (config.NODE_ENV !== "production") return;

  const missing: string[] = [];
  if (!normalizeOptional(config.BETTER_AUTH_SECRET) || config.BETTER_AUTH_SECRET === DEFAULT_AUTH_SECRET || config.BETTER_AUTH_SECRET.length < 32) {
    missing.push("BETTER_AUTH_SECRET");
  }
  if (!normalizeOptional(config.ADMIN_EMAIL)) missing.push("ADMIN_EMAIL");
  if (!normalizeOptional(config.ADMIN_PASSWORD) || config.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD || config.ADMIN_PASSWORD.length < 12) {
    missing.push("ADMIN_PASSWORD");
  }
  if (!normalizeOptional(config.RESEND_API_KEY)) missing.push("RESEND_API_KEY");
  if (!normalizeOptional(config.SUPABASE_URL)) missing.push("SUPABASE_URL");
  if (!normalizeOptional(config.SUPABASE_SERVICE_ROLE_KEY)) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length) {
    throw new Error(`Production env is not secure. Set: ${Array.from(new Set(missing)).join(", ")}`);
  }
}

export function parseEnv(input: Record<string, unknown>) {
  const parsed = envSchema.parse(input);
  validateProductionEnv(parsed);
  return parsed;
}

export const env = parseEnv(Bun.env);

export function parseCorsOrigins(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim().replace(/^CORS_ORIGIN=/, ""))
    .filter(Boolean);
}

export const corsOrigins = parseCorsOrigins(env.CORS_ORIGIN);

export function parseStoragePublicOrigins(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const storagePublicOrigins = parseStoragePublicOrigins(env.STORAGE_PUBLIC_ORIGINS);

export function isAllowedStoragePublicUrl(value: string, origins = storagePublicOrigins) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  return origins.some((origin) => {
    if (origin.includes("*.")) {
      const base = origin.replace("*.", "");
      try {
        const baseUrl = new URL(base);
        return parsed.protocol === baseUrl.protocol && parsed.hostname.endsWith(`.${baseUrl.hostname}`);
      } catch {
        return false;
      }
    }

    try {
      const allowed = new URL(origin);
      return parsed.origin === allowed.origin;
    } catch {
      return false;
    }
  });
}
