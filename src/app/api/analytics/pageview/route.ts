import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { UAParser } from "ua-parser-js";

import { container } from "@/infrastructure/container";
import { isLocale } from "@/domain/value-objects/Locale";

export const runtime = "nodejs";

const BOT_UA_REGEX = /bot|crawl|spider|slurp|bingbot|googlebot|baidu|yandex|duckduck/i;
const DEFAULT_SALT = "matheusbatista-tech-analytics-salt";

const bodySchema = z.object({
  path: z.string().min(1).max(2048),
  locale: z.string().min(2).max(8).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  clientTz: z.string().max(64).optional().nullable(),
  screenW: z.number().int().nonnegative().max(20000).optional().nullable(),
  screenH: z.number().int().nonnegative().max(20000).optional().nullable(),
  viewportW: z.number().int().nonnegative().max(20000).optional().nullable(),
  viewportH: z.number().int().nonnegative().max(20000).optional().nullable(),
  language: z.string().max(32).optional().nullable(),
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

function nullableFloat(raw: string | null): number | null {
  if (!raw) return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function decodeHeader(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

interface BotMatch {
  name: string | null;
  version: string | null;
}

// Heuristic: parse "Googlebot/2.1 (+http://...)" → { name: "Googlebot", version: "2.1" }
function parseBotFromUA(ua: string): BotMatch {
  const m = ua.match(
    /([A-Za-z][A-Za-z0-9_-]*(?:bot|crawler|spider|slurp))(?:\/([0-9][0-9.\-_]*))?/i,
  );
  if (!m) return { name: null, version: null };
  return { name: m[1] ?? null, version: m[2] ?? null };
}

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";

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

  const { path, locale, referrer, clientTz, screenW, screenH, viewportW, viewportH, language } =
    parsed.data;

  // Skip internal/admin/api paths defensively (client also filters)
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
    return new NextResponse(null, { status: 204 });
  }

  // Geo from Vercel edge headers — null in dev / non-Vercel envs
  const countryCode = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  const city = decodeHeader(request.headers.get("x-vercel-ip-city"));
  const serverTz = request.headers.get("x-vercel-ip-timezone");
  const lat = nullableFloat(request.headers.get("x-vercel-ip-latitude"));
  const lon = nullableFloat(request.headers.get("x-vercel-ip-longitude"));

  // UA parsing
  const parser = new UAParser(userAgent);
  const { browser, os, device } = parser.getResult();
  // ua-parser-js returns undefined device.type for desktop browsers
  const deviceType = device.type || "desktop";

  // Bot detection: union of regex + ua-parser-js signals
  const regexIsBot = BOT_UA_REGEX.test(userAgent);
  const parserIsBot =
    (device.type as string | undefined) === "bot" ||
    (browser.name?.toLowerCase().includes("bot") ?? false);
  const isBot = regexIsBot || parserIsBot;

  let botName: string | null = null;
  let botVer: string | null = null;
  if (isBot) {
    const m = parseBotFromUA(userAgent);
    botName = m.name ?? browser.name ?? null;
    botVer = m.version ?? browser.version ?? null;
  }

  // Referrer parsing
  let refHost: string | null = null;
  let refPath: string | null = null;
  if (referrer) {
    try {
      const u = new URL(referrer);
      refHost = u.hostname;
      refPath = u.pathname;
    } catch {
      // malformed referrer — keep raw, drop parsed parts
    }
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
      country: countryCode ?? null,
      countryCode: countryCode ?? null,
      countryName: null,
      city: city ?? null,
      region: region ?? null,
      lat,
      lon,
      serverTz: serverTz ?? null,
      clientTz: clientTz ?? null,
      screenW: screenW ?? null,
      screenH: screenH ?? null,
      viewportW: viewportW ?? null,
      viewportH: viewportH ?? null,
      language: language ?? null,
      browser: browser.name ?? null,
      browserVer: browser.version ?? null,
      os: os.name ?? null,
      osVer: os.version ?? null,
      device: deviceType,
      deviceModel: device.model ?? null,
      isBot,
      botName,
      botVer,
      refHost,
      refPath,
    });
  } catch (err) {
    console.warn("[api/analytics/pageview] log error", err);
  }

  return new NextResponse(null, { status: 204 });
}
