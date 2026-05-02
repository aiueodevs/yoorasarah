import type { Context, MiddlewareHandler } from "hono";
import { redis } from "./db/redis";
import { HttpError } from "./http-error";
import { getRequestIp } from "./request-ip";

type RateLimitInput = {
  key: string;
  limit: number;
  windowSeconds: number;
  code?: string;
  message?: string;
  store?: {
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
  };
};

export const RATE_LIMIT_MESSAGE = "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";

function safeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9:_@.-]+/g, "-").slice(0, 180) || "unknown";
}

export async function assertRateLimit({
  code = "RATE_LIMITED",
  key,
  limit,
  message = RATE_LIMIT_MESSAGE,
  store = redis,
  windowSeconds
}: RateLimitInput) {
  const redisKey = `rate:${safeKey(key)}`;
  try {
    const count = await store.incr(redisKey);
    if (count === 1) await store.expire(redisKey, windowSeconds);
    if (count > limit) throw new HttpError(429, code, message);
    return { count, remaining: Math.max(limit - count, 0) };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(503, "RATE_LIMIT_UNAVAILABLE", "Sistem sedang sibuk. Coba lagi.");
  }
}

export function rateLimitByIp(prefix: string, limit: number, windowSeconds: number): MiddlewareHandler {
  return async (c, next) => {
    await assertRateLimit({
      key: `${prefix}:ip:${getRequestIp(c.req.raw)}`,
      limit,
      windowSeconds
    });
    await next();
  };
}

export async function rateLimitRequestIp(c: Context, prefix: string, limit: number, windowSeconds: number) {
  return assertRateLimit({
    key: `${prefix}:ip:${getRequestIp(c.req.raw)}`,
    limit,
    windowSeconds
  });
}

async function readJsonBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  const body = await request.clone().json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
}

export async function rateLimitAuthSignIn(request: Request) {
  if (request.method !== "POST" || new URL(request.url).pathname !== "/api/auth/sign-in/email") return;
  const body = await readJsonBody(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "unknown";

  await Promise.all([
    assertRateLimit({
      key: `auth-sign-in:ip:${getRequestIp(request)}`,
      limit: 10,
      windowSeconds: 60
    }),
    assertRateLimit({
      key: `auth-sign-in:email:${email}`,
      limit: 20,
      windowSeconds: 60 * 60
    })
  ]);
}
