import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";

export const runtime = "nodejs";

type Source = "message" | "cv" | "error";
const SOURCES: readonly Source[] = ["message", "cv", "error"];

const LATEST_LIMIT = 5;
// Fallback for first-ever visit when no AdminReadMarker exists yet.
// Treats anything older than 14 days as already-seen.
const DEFAULT_LOOKBACK_DAYS = 14;

interface NotificationSummary {
  unread: number;
  latest: NotificationItem[];
}

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string | null;
  createdAt: string;
  href: string;
}

interface NotificationsResponse {
  messages: NotificationSummary;
  cv: NotificationSummary;
  errors: NotificationSummary;
}

async function readMarkerFor(email: string, source: Source): Promise<Date> {
  const row = await prisma.adminReadMarker.findUnique({
    where: { email_source: { email, source } },
  });
  if (row) return row.lastReadAt;
  const fallback = new Date();
  fallback.setUTCDate(fallback.getUTCDate() - DEFAULT_LOOKBACK_DAYS);
  return fallback;
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [messageMark, cvMark, errorMark] = await Promise.all([
    readMarkerFor(email, "message"),
    readMarkerFor(email, "cv"),
    readMarkerFor(email, "error"),
  ]);

  const [messageRows, messageCount, cvRows, cvCount, errorRows, errorCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { createdAt: { gt: messageMark } },
      orderBy: { createdAt: "desc" },
      take: LATEST_LIMIT,
      select: { id: true, from: true, subject: true, createdAt: true },
    }),
    prisma.contactMessage.count({ where: { createdAt: { gt: messageMark } } }),
    prisma.cVDownload.findMany({
      where: { createdAt: { gt: cvMark } },
      orderBy: { createdAt: "desc" },
      take: LATEST_LIMIT,
      select: { id: true, locale: true, createdAt: true },
    }),
    prisma.cVDownload.count({ where: { createdAt: { gt: cvMark } } }),
    prisma.aIUsageLog.findMany({
      where: { createdAt: { gt: errorMark }, status: "error" },
      orderBy: { createdAt: "desc" },
      take: LATEST_LIMIT,
      select: { id: true, kind: true, locale: true, createdAt: true },
    }),
    prisma.aIUsageLog.count({ where: { createdAt: { gt: errorMark }, status: "error" } }),
  ]);

  const response: NotificationsResponse = {
    messages: {
      unread: messageCount,
      latest: messageRows.map((row) => ({
        id: row.id,
        title: row.from,
        subtitle: row.subject ?? null,
        createdAt: row.createdAt.toISOString(),
        href: `/admin/inbox?id=${row.id}`,
      })),
    },
    cv: {
      unread: cvCount,
      latest: cvRows.map((row) => ({
        id: row.id,
        title: `CV download (${row.locale.toUpperCase()})`,
        subtitle: null,
        createdAt: row.createdAt.toISOString(),
        href: "/admin/analytics",
      })),
    },
    errors: {
      unread: errorCount,
      latest: errorRows.map((row) => ({
        id: row.id,
        title: `${row.kind} error`,
        subtitle: row.locale ? row.locale.toUpperCase() : null,
        createdAt: row.createdAt.toISOString(),
        href: "/admin/logs",
      })),
    },
  };

  return NextResponse.json(response);
}

const markSchema = z.object({
  sources: z
    .array(z.enum(["message", "cv", "error"]))
    .min(1)
    .max(SOURCES.length),
});

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = markSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sources" }, { status: 400 });
  }

  const now = new Date();
  await Promise.all(
    parsed.data.sources.map((source) =>
      prisma.adminReadMarker.upsert({
        where: { email_source: { email, source } },
        create: { email, source, lastReadAt: now },
        update: { lastReadAt: now },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
