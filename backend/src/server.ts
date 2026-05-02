import { cors } from "hono/cors";
import { Hono } from "hono";
import { auth } from "./auth";
import {
  isVerificationEmailRateLimitError,
  preflightVerificationEmailRateLimit,
  verificationEmailRateLimitPayload
} from "./auth-email-rate-limit";
import { normalizeAuthEmailRequest } from "./auth-request";
import { corsOrigins, env } from "./env";
import { errorPayload, isHttpError } from "./http-error";
import { rateLimitAuthSignIn } from "./rate-limit";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";
import { securityHeaders } from "./security-headers";

export function internalErrorResponse(error: Error, nodeEnv: string = env.NODE_ENV) {
  return {
    status: 500 as const,
    body: {
      code: "INTERNAL_SERVER_ERROR",
      message: nodeEnv === "production" ? "Internal server error" : error.message || "Internal server error"
    }
  };
}

export function createApp() {
  const app = new Hono();

  app.use("*", securityHeaders());
  app.use("*", cors({
    origin: (origin) => {
      if (!origin) return undefined;
      return corsOrigins.includes(origin) ? origin : undefined;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  }));

  app.on(["GET", "POST"], "/api/auth/*", async (c) => {
    try {
      const normalizedRequest = await normalizeAuthEmailRequest(c.req.raw);
      await rateLimitAuthSignIn(normalizedRequest);
      const rateLimitedRequest = await preflightVerificationEmailRateLimit(normalizedRequest);
      return auth.handler(rateLimitedRequest);
    } catch (error) {
      if (isHttpError(error)) {
        return c.json(errorPayload(error), error.status);
      }
      if (isVerificationEmailRateLimitError(error)) {
        return c.json(verificationEmailRateLimitPayload(), 429);
      }

      throw error;
    }
  });

  app.route("/", publicRoutes);
  app.route("/", adminRoutes);

  app.notFound((c) => c.json({ message: "Route not found" }, 404));

  app.onError((error, c) => {
    console.error(error);
    if (isHttpError(error)) {
      return c.json(errorPayload(error), error.status);
    }
    const response = internalErrorResponse(error, env.NODE_ENV);
    return c.json(response.body, response.status);
  });

  return app;
}

export const app = createApp();

if (import.meta.main) {
  Bun.serve({
    port: env.PORT,
    fetch: app.fetch
  });

  console.log(`Yoora Sarah backend running on http://localhost:${env.PORT}`);
}
