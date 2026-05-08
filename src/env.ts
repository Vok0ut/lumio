import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isDev = process.env.NODE_ENV !== "production";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().min(1),
    // Opcionales en desarrollo
    GOOGLE_CLIENT_ID: isDev ? z.string().default("") : z.string().min(1),
    GOOGLE_CLIENT_SECRET: isDev ? z.string().default("") : z.string().min(1),
    RESEND_API_KEY: isDev ? z.string().default("") : z.string().min(1),
    UPSTASH_REDIS_REST_URL: isDev ? z.string().default("") : z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: isDev ? z.string().default("") : z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? "",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
