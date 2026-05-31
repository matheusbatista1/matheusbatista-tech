import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";

import { container } from "@/infrastructure/container";
import { isLocale } from "@/domain/value-objects/Locale";

export const runtime = "nodejs";

const BOT_UA_REGEX = /bot|crawl|spider|crawler|slurp|mediapartners|facebookexternalhit/i;
const DEFAULT_SALT = "matheusbatista-tech-analytics-salt";

const bodySchema = z.object({
  path: z.string().min(1).max(2048),
  locale: z.string().min(2).max(8).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  const raw = forwarded?.split(",")[0]?.trim() ?? cfIp ?? realIp ?? "unknown";
  return raw;
}

function hashIp(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || DEFAULT_SALT;
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";

  // Bot filter — never log automated traffic
  if (BOT_UA_REGEX.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new NextResponse(null, { status: 204 });
  }

  const { path, locale, referrer } = parsed.data;

  // Skip internal/admin/api paths defensively (client also filters)
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
    return new NextResponse(null, { status: 204 });
  }

  const ipHash = hashIp(getClientIp(request));
  const safeLocale = locale && isLocale(locale) ? locale : null;

  try {
    await container.useCases.logPageView.execute({
      path,
      locale: safeLocale,
      referrer: referrer ?? null,
      userAgent: userAgent.slice(0, 512),
      ipHash,
    });
  } catch (err) {
    console.warn("[api/analytics/pageview] log error", err);
  }

  return new NextResponse(null, { status: 204 });
}
