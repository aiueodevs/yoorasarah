import { env } from "./env";

function firstHeaderIp(value: string | null | undefined) {
  return value?.split(",")[0]?.trim() || null;
}

export function getRequestIp(request?: Request) {
  const directIp = request?.headers.get("x-real-ip") ?? request?.headers.get("remote-addr") ?? null;
  if (!env.TRUST_PROXY) return firstHeaderIp(directIp) ?? "unknown";

  return (
    firstHeaderIp(request?.headers.get("cf-connecting-ip")) ??
    firstHeaderIp(request?.headers.get("x-forwarded-for")) ??
    firstHeaderIp(directIp) ??
    "unknown"
  );
}
