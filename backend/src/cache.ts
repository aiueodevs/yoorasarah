import { redis } from "./db/redis";

const DEFAULT_TTL_SECONDS = 60 * 5;

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function withJsonCache<T>(key: string, loader: () => Promise<T>, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<T> {
  const cached = await getCachedJson<T>(key);
  if (cached) return cached;

  const value = await loader();
  await setCachedJson(key, value, ttlSeconds);
  return value;
}

export async function deleteCacheKeys(keys: string[]) {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

export async function deleteCachePattern(pattern: string) {
  const keys = await redis.keys(pattern);
  await deleteCacheKeys(keys);
}
