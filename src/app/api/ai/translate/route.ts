import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";
import { LOCALES } from "@/domain/value-objects/Locale";

export const runtime = "nodejs";

const localeSchema = z.enum(LOCALES);

const translateSchema = z.object({
  text: z.string().min(1).max(10000),
  from: localeSchema.optional(),
  targets: z.array(localeSchema).min(1),
});

export async function POST(request: Request) {
  if (!isAIEnabled) {
    return NextResponse.json(
      { error: "AI is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

  const parsed = translateSchema.safeParse(body);
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

  if (!perMinute.success || !perDay.success) {
    try {
      await container.useCases.logAIUsage.execute({
        kind: "translate-text",
        locale: parsed.data.from ?? "en",
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
    const result = await container.useCases.translateText.execute({
      text: parsed.data.text,
      from: parsed.data.from,
      targets: parsed.data.targets,
      actorId: session.user.id ?? null,
      actorEmail: session.user.email,
      ip,
    });
    return NextResponse.json(
      { translated: result.translated, cached: result.cached },
      { headers: { "X-AI-Cached": String(result.cached) } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid AI response", details: error.flatten() },
        { status: 422 },
      );
    }
    console.error("ai/translate route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
