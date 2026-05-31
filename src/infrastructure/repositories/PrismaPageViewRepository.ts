import type { PageView as PrismaPageView } from "@prisma/client";
import type { PageView, NewPageView } from "@/domain/entities/PageView";
import type { IPageViewRepository } from "@/domain/repositories/IPageViewRepository";
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
}
