import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { getHashedIp } from "@/presentation/lib/ip";
import { isAIEnabled } from "@/infrastructure/config/env";

export const runtime = "nodejs";

const inputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
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

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const ip = getHashedIp(request);
  const [perMinute, perDay] = await Promise.all([
    container.ai.rateLimits.chat.limit(`ai-suggest-tags:${ip}`),
    container.ai.rateLimits.daily.limit(`ai-suggest-tags:${ip}`),
  ]);

  if (!perMinute.success || !perDay.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.max(perMinute.reset, perDay.reset) },
      { status: 429 },
    );
  }

  try {
    const result = await container.useCases.suggestProjectTags.execute({
      name: parsed.data.name,
      description: parsed.data.description,
      actorEmail: session.user.email,
      ip,
    });
    return NextResponse.json(
      { tags: result.tags, cached: result.cached },
      { headers: { "X-AI-Cached": String(result.cached) } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "AI returned invalid output", details: error.flatten() },
        { status: 422 },
      );
    }
    console.error("ai/suggest-tags route error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
