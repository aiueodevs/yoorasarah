import type { MiddlewareHandler } from "hono";

export function securityHeaders(): MiddlewareHandler {
  return async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    c.header("X-Frame-Options", "DENY");
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; connect-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self'"
    );
  };
}
