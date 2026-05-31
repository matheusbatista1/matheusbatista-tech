import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

export const runtime = "nodejs";

const sourceSchema = z
  .enum(["all", "api", "database", "auth", "system", "ai", "email", "activity"])
  .default("all");
const levelSchema = z.enum(["all", "error", "warn", "info", "debug"]).default("all");

const querySchema = z.object({
  source: sourceSchema.optional(),
  level: levelSchema.optional(),
  search: z.string().max(200).optional(),
  since: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = {
    source: searchParams.get("source") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    since: searchParams.get("since") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  };

  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { source, level, search, since, limit, offset } = parsed.data;

  try {
    const result = await container.useCases.listLogs.execute({
      source,
      level,
      search,
      since: since ? new Date(since) : undefined,
      limit,
      offset,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("admin/logs route error", error);
    return NextResponse.json({ error: "Failed to list logs" }, { status: 500 });
  }
}
