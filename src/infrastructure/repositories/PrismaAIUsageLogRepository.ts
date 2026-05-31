import type { AIUsageLog as PrismaAIUsageLog } from "@prisma/client";
import type { AIUsageEvent, AIUsageStatus, NewAIUsageEvent } from "@/domain/entities/AIUsageEvent";
import type { IAIUsageLogRepository } from "@/domain/repositories/IAIUsageLogRepository";
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
    createdAt: row.createdAt,
  };
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
}
