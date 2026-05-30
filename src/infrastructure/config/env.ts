import { z } from "zod";

const envSchema = z.object({
  // Public
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // AI (Google Gemini free tier)
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),

  // Rate limit (Upstash) — opcional em dev
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Auth (NextAuth v5 / Auth.js)
  // Vazio em dev e ai cai no fallback abaixo. Em prod, defina via AUTH_SECRET.
  AUTH_SECRET: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  AUTH_GOOGLE_ID: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  AUTH_GOOGLE_SECRET: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  AUTH_ALLOWED_EMAILS: z
    .string()
    .optional()
    .transform((v) => v || ""),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

export const isAIEnabled = Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY);
export const isRateLimitEnabled = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);
export const isAuthConfigured = Boolean(
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET && env.AUTH_ALLOWED_EMAILS,
);
