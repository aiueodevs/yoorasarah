import Redis from "ioredis";
import { env } from "../env";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis = globalForRedis.redis ?? new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: false,
  lazyConnect: true
});

redis.on("error", (error) => {
  console.error("[redis]", error.message);
});

if (Bun.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
