import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";
import { isLocale } from "@/domain/value-objects/Locale";
import { isPersonaId, DEFAULT_PERSONA } from "@/domain/entities/ai/Persona";

export const runtime = "nodejs";

const personaSchema = z.object({
  persona: z.string(),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isAIEnabled) {
    return NextResponse.json(
      { error: "AI is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = personaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const ip = getHashedIp(request);
  const [perMinute, perDay] = await Promise.all([
    container.ai.rateLimits.chat.limit(ip),
    container.ai.rateLimits.daily.limit(ip),
  ]);

  const persona = isPersonaId(parsed.data.persona) ? parsed.data.persona : DEFAULT_PERSONA;
  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : "en";

  if (!perMinute.success || !perDay.success) {
    try {
      await container.useCases.logAIUsage.execute({
        kind: "persona-adapt",
        locale,
        persona,
        ip,
        cached: false,
        durationMs: 0,
        status: "rate_limited",
      });
    } catch {
      /* best-effort */
    }
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.max(perMinute.reset, perDay.reset) },
      { status: 429 },
    );
  }

  try {
    const result = await container.useCases.adaptPersonaCopy.execute({ persona, locale, ip });
    return NextResponse.json(
      { copy: result.copy, cached: result.cached },
      { headers: { "X-AI-Cached": String(result.cached) } },
    );
  } catch (error) {
    console.error("ai/persona route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
