import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { rangeToSince } from "@/application/use-cases/analytics/GetVisitsOverview";

export const runtime = "nodejs";

const querySchema = z.object({
  range: z.enum(["today", "7d", "30d", "all"]).optional(),
  locale: z.enum(["en", "pt", "es"]).optional(),
  page: z.coerce.number().int().min(0).default(0),
  perPage: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    range: searchParams.get("range") ?? undefined,
    locale: searchParams.get("locale") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    perPage: searchParams.get("perPage") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const { range, locale, page, perPage } = parsed.data;
  const since = range ? rangeToSince(range) : undefined;

  try {
    const { entries, total } = await container.useCases.listCVDownloads.execute({
      limit: perPage,
      offset: page * perPage,
      locale,
      since,
    });
    return NextResponse.json({
      entries,
      total,
      page,
      perPage,
      hasMore: (page + 1) * perPage < total,
    });
  } catch (error) {
    console.error("admin/cv-downloads route error", error);
    return NextResponse.json({ error: "Failed to list CV downloads" }, { status: 500 });
  }
}
