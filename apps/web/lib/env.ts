import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  // Only validate in server and test environments
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  // Skip validation in test to avoid the error
  skipValidation: process.env.NODE_ENV === "test" ? true : undefined,
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
    REDIS_REST_URL: z.url().min(1),
    REDIS_REST_TOKEN: z.string().min(1),
    MAIL_FROM: z.email().min(1),
    SUPPORT_MAIL: z.email().min(1),
    GOOGLE_MAIL_USER: z.string().min(1),
    GOOGLE_MAIL_PASS: z.string().min(1),
    MAILHOG_HOST: z.string().min(1),
    MAILHOG_PORT: z
      .string()
      .default("1025")
      .transform((arg) => parseInt(arg)),
    API_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    SUPABASE_SECRET_KEY: z.string().min(1),
    SUPABASE_PUBLIC_STORAGE_BUCKET: z.string().min(1),
    SUPABASE_PRIVATE_STORAGE_BUCKET: z.string().min(1),
    GOOGLE_AUTH_CLIENT_SECRET: z.string().min(1),
    WEB_PUSH_PRIVATE_KEY: z.string().min(1),
    QSTASH_URL: z.url().min(1),
    QSTASH_TOKEN: z.string().min(1),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_PUBLIC_SITE_URL: z.url().min(1),
    NEXT_PUBLIC_SITE_NAME: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_URL: z.url().min(1),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_REST_URL: process.env.REDIS_REST_URL,
    REDIS_REST_TOKEN: process.env.REDIS_REST_TOKEN,
    MAIL_FROM: process.env.MAIL_FROM,
    SUPPORT_MAIL: process.env.SUPPORT_MAIL,
    GOOGLE_MAIL_USER: process.env.GOOGLE_MAIL_USER,
    GOOGLE_MAIL_PASS: process.env.GOOGLE_MAIL_PASS,
    MAILHOG_HOST: process.env.MAILHOG_HOST,
    MAILHOG_PORT: process.env.MAILHOG_PORT,
    API_LOG_LEVEL: process.env.API_LOG_LEVEL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_PUBLIC_STORAGE_BUCKET: process.env.SUPABASE_PUBLIC_STORAGE_BUCKET,
    SUPABASE_PRIVATE_STORAGE_BUCKET:
      process.env.SUPABASE_PRIVATE_STORAGE_BUCKET,
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
  },
});
