import type { AIUsageLog as PrismaAIUsageLog, Prisma } from "@prisma/client";
import type { AIUsageEvent, AIUsageStatus, NewAIUsageEvent } from "@/domain/entities/AIUsageEvent";
import type {
  IAIUsageLogRepository,
  ListRecentAIUsageOptions,
} from "@/domain/repositories/IAIUsageLogRepository";
import type { Locale } from "@/domain/value-objects/Locale";
import { prisma } from "../db/prisma";

function toAIUsageEvent(row: PrismaAIUsageLog): AIUsageEvent {
  return {
    id: row.id,
    kind: row.kind,
    locale: row.locale as Locale,
    persona: row.persona,
    ip: row.ipHash,
    tokensIn: row.tokensIn,
    tokensOut: row.tokensOut,
    cached: row.cached,
    durationMs: row.durationMs,
    status: row.status as AIUsageStatus,
    error: row.error,
    createdAt: row.createdAt,
  };
}

function buildFilteredWhere(
  opts: Omit<ListRecentAIUsageOptions, "limit" | "offset">,
): Prisma.AIUsageLogWhereInput {
  const { kind, status, since } = opts;
  const where: Prisma.AIUsageLogWhereInput = {};
  if (kind) where.kind = kind;
  if (status) where.status = status;
  if (since) where.createdAt = { gte: since };
  return where;
}

export class PrismaAIUsageLogRepository implements IAIUsageLogRepository {
  async create(input: NewAIUsageEvent): Promise<AIUsageEvent> {
    const row = await prisma.aIUsageLog.create({
      data: {
        kind: input.kind,
        locale: input.locale,
        persona: input.persona,
        ipHash: input.ip,
        tokensIn: input.tokensIn,
        tokensOut: input.tokensOut,
        cached: input.cached,
        durationMs: input.durationMs,
        status: input.status,
        error: input.error,
      },
    });
    return toAIUsageEvent(row);
  }

  async count(): Promise<number> {
    return prisma.aIUsageLog.count();
  }

  async countSince(date: Date): Promise<number> {
    return prisma.aIUsageLog.count({ where: { createdAt: { gte: date } } });
  }

  async countByDayRange(from: Date, to: Date): Promise<Map<string, number>> {
    const rows = await prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "AIUsageLog"
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

  async listRecent(opts: ListRecentAIUsageOptions = {}): Promise<AIUsageEvent[]> {
    const { limit = 50, offset = 0, ...rest } = opts;
    const rows = await prisma.aIUsageLog.findMany({
      where: buildFilteredWhere(rest),
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return rows.map(toAIUsageEvent);
  }

  async countFiltered(
    opts: Omit<ListRecentAIUsageOptions, "limit" | "offset"> = {},
  ): Promise<number> {
    return prisma.aIUsageLog.count({ where: buildFilteredWhere(opts) });
  }
}
