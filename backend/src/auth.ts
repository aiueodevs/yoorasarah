import { redisStorage } from "@better-auth/redis-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "./env";
import { db } from "./db";
import { redis } from "./db/redis";
import { sendBetterAuthVerificationEmail } from "./email/verification";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    autoSignIn: false,
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: sendBetterAuthVerificationEmail
  },
  user: {
    changeEmail: {
      enabled: true
    }
  },
  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: "better-auth:"
  }),
  trustedOrigins: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
});
