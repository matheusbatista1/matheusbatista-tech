import type { CVDownload as PrismaCVDownload } from "@prisma/client";
import type { CVDownload, NewCVDownload } from "@/domain/entities/CVDownload";
import type {
  CVDownloadListResult,
  ICVDownloadRepository,
  ListCVDownloadsOptions,
} from "@/domain/repositories/ICVDownloadRepository";
import type { Locale } from "@/domain/value-objects/Locale";
import { prisma } from "../db/prisma";

function toCVDownload(row: PrismaCVDownload): CVDownload {
  return {
    id: row.id,
    locale: row.locale as Locale,
    cvAssetId: row.cvAssetId,
    ipHash: row.ipHash,
    userAgent: row.userAgent,
    referrer: row.referrer,
    country: row.country,
    city: row.city,
    createdAt: row.createdAt,
  };
}

export class PrismaCVDownloadRepository implements ICVDownloadRepository {
  async create(input: NewCVDownload): Promise<CVDownload> {
    const row = await prisma.cVDownload.create({
      data: {
        locale: input.locale,
        cvAssetId: input.cvAssetId,
        ipHash: input.ipHash,
        userAgent: input.userAgent,
        referrer: input.referrer,
        country: input.country,
        city: input.city,
      },
    });
    return toCVDownload(row);
  }

  async listPaged(opts: ListCVDownloadsOptions): Promise<CVDownloadListResult> {
    const { limit = 50, offset = 0, locale, since } = opts;
    const where = {
      ...(locale ? { locale } : {}),
      ...(since ? { createdAt: { gte: since } } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.cVDownload.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.cVDownload.count({ where }),
    ]);
    return { entries: rows.map(toCVDownload), total };
  }

  async count(): Promise<number> {
    return prisma.cVDownload.count();
  }

  async countSince(date: Date): Promise<number> {
    return prisma.cVDownload.count({ where: { createdAt: { gte: date } } });
  }

  async countByDayRange(from: Date, to: Date): Promise<Map<string, number>> {
    const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "CVDownload"
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
