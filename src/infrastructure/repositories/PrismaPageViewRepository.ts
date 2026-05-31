import type { PageView as PrismaPageView, Prisma } from "@prisma/client";
import type { PageView, NewPageView } from "@/domain/entities/PageView";
import type {
  IPageViewRepository,
  ListPagedOptions,
  ListPagedResult,
  AggregateOptions,
  CountryAggregate,
  PathAggregate,
} from "@/domain/repositories/IPageViewRepository";
import type { Locale } from "@/domain/value-objects/Locale";
import { isLocale } from "@/domain/value-objects/Locale";
import { prisma } from "../db/prisma";

function toPageView(row: PrismaPageView): PageView {
  return {
    id: row.id,
    path: row.path,
    locale: row.locale && isLocale(row.locale) ? (row.locale as Locale) : null,
    referrer: row.referrer,
    userAgent: row.userAgent,
    ipHash: row.ipHash,
    country: row.country,
    countryCode: row.countryCode,
    countryName: row.countryName,
    city: row.city,
    region: row.region,
    lat: row.lat,
    lon: row.lon,
    serverTz: row.serverTz,
    clientTz: row.clientTz,
    screenW: row.screenW,
    screenH: row.screenH,
    viewportW: row.viewportW,
    viewportH: row.viewportH,
    language: row.language,
    browser: row.browser,
    browserVer: row.browserVer,
    os: row.os,
    osVer: row.osVer,
    device: row.device,
    deviceModel: row.deviceModel,
    isBot: row.isBot,
    botName: row.botName,
    botVer: row.botVer,
    refHost: row.refHost,
    refPath: row.refPath,
    createdAt: row.createdAt,
  };
}

export class PrismaPageViewRepository implements IPageViewRepository {
  async create(input: NewPageView): Promise<PageView> {
    const row = await prisma.pageView.create({
      data: {
        path: input.path,
        locale: input.locale ?? null,
        referrer: input.referrer,
        userAgent: input.userAgent,
        ipHash: input.ipHash,
        country: input.country,
        countryCode: input.countryCode,
        countryName: input.countryName,
        city: input.city,
        region: input.region,
        lat: input.lat,
        lon: input.lon,
        serverTz: input.serverTz,
        clientTz: input.clientTz,
        screenW: input.screenW,
        screenH: input.screenH,
        viewportW: input.viewportW,
        viewportH: input.viewportH,
        language: input.language,
        browser: input.browser,
        browserVer: input.browserVer,
        os: input.os,
        osVer: input.osVer,
        device: input.device,
        deviceModel: input.deviceModel,
        isBot: input.isBot ?? false,
        botName: input.botName,
        botVer: input.botVer,
        refHost: input.refHost,
        refPath: input.refPath,
      },
    });
    return toPageView(row);
  }

  async count(): Promise<number> {
    return prisma.pageView.count();
  }

  async countSince(date: Date): Promise<number> {
    return prisma.pageView.count({ where: { createdAt: { gte: date } } });
  }

  async countByDayRange(from: Date, to: Date): Promise<Map<string, number>> {
    const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "PageView"
      WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
      GROUP BY day
      ORDER BY day ASC
    `;
    const out = new Map<string, number>();
    for (const row of rows) {
      const key = row.day.toISOString().slice(0, 10);
      out.set(key, Number(row.count));
    }
    return out;
  }

  async listPaged(opts: ListPagedOptions): Promise<ListPagedResult> {
    const { limit = 50, offset = 0, isBot, countryCode, since, until, search } = opts;

    const and: Prisma.PageViewWhereInput[] = [];
    if (typeof isBot === "boolean") and.push({ isBot });
    if (countryCode) and.push({ countryCode });
    if (since || until) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (since) createdAt.gte = since;
      if (until) createdAt.lt = until;
      and.push({ createdAt });
    }
    if (search && search.trim().length > 0) {
      const q = search.trim();
      and.push({
        OR: [
          { path: { contains: q, mode: "insensitive" } },
          { country: { contains: q, mode: "insensitive" } },
          { browser: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { os: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.PageViewWhereInput = and.length > 0 ? { AND: and } : {};

    const [rows, total] = await Promise.all([
      prisma.pageView.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.pageView.count({ where }),
    ]);

    return { entries: rows.map(toPageView), total };
  }

  async countUniqueIpHashes(since?: Date): Promise<number> {
    const rows = since
      ? await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT "ipHash")::bigint AS count
          FROM "PageView"
          WHERE "createdAt" >= ${since}
        `
      : await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT "ipHash")::bigint AS count
          FROM "PageView"
        `;
    return Number(rows[0]?.count ?? 0n);
  }

  async countBots(since?: Date): Promise<number> {
    return prisma.pageView.count({
      where: {
        isBot: true,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
    });
  }

  async aggregateTopCountries(opts: AggregateOptions = {}): Promise<CountryAggregate[]> {
    const { since, limit = 10 } = opts;
    const rows = since
      ? await prisma.$queryRaw<Array<{ countryCode: string | null; n: bigint }>>`
          SELECT "countryCode", COUNT(*)::bigint AS n
          FROM "PageView"
          WHERE "createdAt" >= ${since}
          GROUP BY "countryCode"
          ORDER BY n DESC
          LIMIT ${limit}
        `
      : await prisma.$queryRaw<Array<{ countryCode: string | null; n: bigint }>>`
          SELECT "countryCode", COUNT(*)::bigint AS n
          FROM "PageView"
          GROUP BY "countryCode"
          ORDER BY n DESC
          LIMIT ${limit}
        `;
    return rows.map((r) => ({ countryCode: r.countryCode, count: Number(r.n) }));
  }

  async aggregateTopPaths(opts: AggregateOptions = {}): Promise<PathAggregate[]> {
    const { since, limit = 10 } = opts;
    const rows = since
      ? await prisma.$queryRaw<Array<{ path: string; n: bigint }>>`
          SELECT "path", COUNT(*)::bigint AS n
          FROM "PageView"
          WHERE "createdAt" >= ${since}
          GROUP BY "path"
          ORDER BY n DESC
          LIMIT ${limit}
        `
      : await prisma.$queryRaw<Array<{ path: string; n: bigint }>>`
          SELECT "path", COUNT(*)::bigint AS n
          FROM "PageView"
          GROUP BY "path"
          ORDER BY n DESC
          LIMIT ${limit}
        `;
    return rows.map((r) => ({ path: r.path, count: Number(r.n) }));
  }
}
