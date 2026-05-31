import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";
import { SummarizeInputSchema } from "@/application/ai/schemas/summarize";

export const runtime = "nodejs";

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

  const parsed = SummarizeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const ip = getHashedIp(request);
  const [perMinute, perDay] = await Promise.all([
    container.ai.rateLimits.chat.limit(`ai-summarize:${ip}`),
    container.ai.rateLimits.daily.limit(`ai-summarize:${ip}`),
  ]);

  if (!perMinute.success || !perDay.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.max(perMinute.reset, perDay.reset) },
      { status: 429 },
    );
  }

  try {
    const result = await container.useCases.summarizeText.execute({
      text: parsed.data.text,
      maxWords: parsed.data.maxWords,
      locale: parsed.data.locale,
      actorEmail: session.user.email,
      actorId: session.user.id ?? null,
      ip,
    });
    return NextResponse.json(
      { summary: result.summary, cached: result.cached },
      { headers: { "X-AI-Cached": String(result.cached) } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "AI returned invalid output", details: error.flatten() },
        { status: 422 },
      );
    }
    console.error("ai/summarize route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
