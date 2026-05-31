import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";
import { isLocale } from "@/domain/value-objects/Locale";
import { MessageNotFoundError } from "@/application/use-cases/ai/DraftReplyToMessage";

export const runtime = "nodejs";

const draftReplySchema = z.object({
  messageId: z.string().min(1).max(200),
  tone: z.enum(["friendly", "professional", "brief"]).optional(),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isAIEnabled) {
    return NextResponse.json(
      { error: "AI is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 503 },
    );
  }

  const settings = await container.useCases.getSiteSettings.execute();
  if (!settings.aiFeaturesEnabled) {
    return NextResponse.json({ error: "AI features are disabled" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = draftReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const ip = getHashedIp(request);
  const [perMinute, perDay] = await Promise.all([
    container.ai.rateLimits.chat.limit(`ai-draft-reply:${ip}`),
    container.ai.rateLimits.daily.limit(`ai-draft-reply:${ip}`),
  ]);

  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : "en";

  if (!perMinute.success || !perDay.success) {
    try {
      await container.useCases.logAIUsage.execute({
        kind: "draft-reply",
        locale,
        persona: parsed.data.tone ?? null,
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
    const result = await container.useCases.draftReplyToMessage.execute({
      messageId: parsed.data.messageId,
      tone: parsed.data.tone,
      locale,
      actorId: session.user.id ?? null,
      actorEmail: session.user.email,
      ip,
    });
    return NextResponse.json(
      {
        body: result.draft.body,
        cached: result.cached,
      },
      { headers: { "X-AI-Cached": String(result.cached) } },
    );
  } catch (error) {
    if (error instanceof MessageNotFoundError) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "AI returned invalid output", details: error.flatten() },
        { status: 422 },
      );
    }
    if (error instanceof Error && (error as Error & { code?: string }).code === "RATE_LIMITED") {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    console.error("ai/draft-reply route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
