import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";
import { isLocale } from "@/domain/value-objects/Locale";

export const runtime = "nodejs";

const searchSchema = z.object({
  query: z.string().min(1).max(200),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isAIEnabled) {
    return NextResponse.json(
      { error: "AI is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 503 },
    );
  }

  const ip = getHashedIp(request);
  const [perMinute, perDay] = await Promise.all([
    container.ai.rateLimits.chat.limit(ip),
    container.ai.rateLimits.daily.limit(ip),
  ]);

  if (!perMinute.success || !perDay.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.max(perMinute.reset, perDay.reset) },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : "en";

  try {
    const result = await container.useCases.semanticSearchProjects.execute({
      query: parsed.data.query,
      locale,
    });
    return NextResponse.json(
      { ranked: result.ranked, cached: result.cached },
      { headers: { "X-AI-Cached": String(result.cached) } },
    );
  } catch (error) {
    console.error("ai/search route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
