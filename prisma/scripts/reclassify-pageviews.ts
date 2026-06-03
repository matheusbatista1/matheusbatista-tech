/**
 * Re-runs bot detection on every PageView row, applying the current
 * regex + stale-UA heuristic from src/app/api/analytics/pageview/route.ts
 * to historical data so old visits get the same treatment as new ones.
 *
 * Usage (one-shot, with DATABASE_URL pointing at the target DB):
 *
 *   pnpm tsx prisma/scripts/reclassify-pageviews.ts
 *
 * Idempotent — re-running it has no effect when the classification is
 * already up to date.
 */

import { PrismaClient } from "@prisma/client";
import { UAParser } from "ua-parser-js";

const prisma = new PrismaClient();

const BOT_UA_REGEX =
  /bot|crawl|spider|slurp|bingbot|googlebot|baidu|yandex|duckduck|headless|phantom|puppeteer|selenium|playwright|lighthouse|chrome-lighthouse|gtmetrix|pingdom|uptimerobot|prerender|chromedriver|webdriver|curl|wget|httpclient|axios|node-fetch|python-requests|libwww|okhttp|java\/\d/i;

const STALE_VERSION_FLOORS: Record<string, number> = {
  "mobile safari": 14,
  safari: 14,
  chrome: 100,
  firefox: 100,
  edge: 100,
  opera: 80,
};

function isStaleUserAgent(browserName?: string, browserVersion?: string): boolean {
  if (!browserName || !browserVersion) return false;
  const floor = STALE_VERSION_FLOORS[browserName.toLowerCase()];
  if (typeof floor !== "number") return false;
  const major = Number.parseInt(browserVersion.split(".")[0] ?? "", 10);
  if (!Number.isFinite(major)) return false;
  return major < floor;
}

interface BotMatch {
  name: string | null;
  version: string | null;
}

function parseBotFromUA(ua: string): BotMatch {
  const m = ua.match(
    /([A-Za-z][A-Za-z0-9_-]*(?:bot|crawler|spider|slurp))(?:\/([0-9][0-9.\-_]*))?/i,
  );
  if (!m) return { name: null, version: null };
  return { name: m[1] ?? null, version: m[2] ?? null };
}

interface Classification {
  isBot: boolean;
  botName: string | null;
  botVer: string | null;
}

function classify(userAgent: string | null): Classification {
  if (!userAgent) return { isBot: false, botName: null, botVer: null };

  const parser = new UAParser(userAgent);
  const { browser, device } = parser.getResult();

  const regexIsBot = BOT_UA_REGEX.test(userAgent);
  const parserIsBot =
    (device.type as string | undefined) === "bot" ||
    (browser.name?.toLowerCase().includes("bot") ?? false);
  const staleIsBot = isStaleUserAgent(browser.name, browser.version);
  const isBot = regexIsBot || parserIsBot || staleIsBot;

  if (!isBot) return { isBot: false, botName: null, botVer: null };

  const m = parseBotFromUA(userAgent);
  let botName = m.name ?? browser.name ?? null;
  const botVer = m.version ?? browser.version ?? null;
  if (!regexIsBot && !parserIsBot && staleIsBot) {
    botName = `stale-${browser.name?.toLowerCase().replace(/\s+/g, "-") ?? "ua"}`;
  }
  return { isBot, botName, botVer };
}

async function main() {
  const total = await prisma.pageView.count();
  console.log(`Reclassifying ${total} pageviews...`);

  const BATCH = 500;
  let processed = 0;
  let flipped = 0;
  let cursor: string | undefined;

  while (true) {
    const rows = await prisma.pageView.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, userAgent: true, isBot: true, botName: true, botVer: true },
    });
    if (rows.length === 0) break;

    for (const row of rows) {
      const next = classify(row.userAgent);
      const same =
        next.isBot === row.isBot && next.botName === row.botName && next.botVer === row.botVer;
      if (same) continue;
      await prisma.pageView.update({
        where: { id: row.id },
        data: {
          isBot: next.isBot,
          botName: next.botName,
          botVer: next.botVer,
        },
      });
      flipped += 1;
    }

    processed += rows.length;
    cursor = rows[rows.length - 1]?.id;
    console.log(`  processed ${processed}/${total} · ${flipped} reclassified so far`);
    if (rows.length < BATCH) break;
  }

  console.log(`Done. ${flipped} of ${total} pageviews were reclassified.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
