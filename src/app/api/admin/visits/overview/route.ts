import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

export const runtime = "nodejs";

const querySchema = z.object({
  range: z.enum(["today", "7d", "30d", "all"]).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    range: searchParams.get("range") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const overview = await container.useCases.getVisitsOverview.execute({
      range: parsed.data.range,
    });
    return NextResponse.json(overview);
  } catch (error) {
    console.error("admin/visits/overview route error", error);
    return NextResponse.json({ error: "Failed to load visits overview" }, { status: 500 });
  }
}
