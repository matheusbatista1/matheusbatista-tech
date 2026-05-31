import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { rangeToSince } from "@/application/use-cases/analytics/GetVisitsOverview";

export const runtime = "nodejs";

const querySchema = z.object({
  range: z.enum(["today", "7d", "30d", "all"]).optional(),
  kind: z.enum(["all", "human", "bot"]).optional(),
  country: z.string().optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(0).default(0),
  perPage: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = {
    range: searchParams.get("range") ?? undefined,
    kind: searchParams.get("kind") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    perPage: searchParams.get("perPage") ?? undefined,
  };

  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { range, kind, country, q, page, perPage } = parsed.data;

  const isBot = kind === "human" ? false : kind === "bot" ? true : undefined;
  const since = range ? rangeToSince(range) : undefined;

  try {
    const { entries, total } = await container.useCases.listVisits.execute({
      limit: perPage,
      offset: page * perPage,
      isBot,
      countryCode: country,
      since,
      search: q,
    });

    return NextResponse.json({
      entries,
      total,
      page,
      perPage,
      hasMore: (page + 1) * perPage < total,
    });
  } catch (error) {
    console.error("admin/visits route error", error);
    return NextResponse.json({ error: "Failed to list visits" }, { status: 500 });
  }
}
