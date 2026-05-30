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
