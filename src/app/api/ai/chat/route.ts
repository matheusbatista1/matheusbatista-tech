import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";
import { isLocale } from "@/domain/value-objects/Locale";
import { isPersonaId, DEFAULT_PERSONA } from "@/domain/entities/ai/Persona";

export const runtime = "nodejs";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1),
  persona: z.string().optional(),
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

  // Rate limit duplo: por minuto + diario
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

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const persona = isPersonaId(parsed.data.persona) ? parsed.data.persona : DEFAULT_PERSONA;
  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : "en";

  try {
    const result = await container.useCases.chatWithAssistant.execute({
      messages: parsed.data.messages,
      persona,
      locale,
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("ai/chat route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
