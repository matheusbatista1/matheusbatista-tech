import type {
  AICacheEntry,
  IAICacheRepository,
  NewAICacheEntry,
} from "@/domain/repositories/IAICacheRepository";
import { prisma } from "../db/prisma";

export class PrismaAICacheRepository implements IAICacheRepository {
  async findByHash(hash: string): Promise<AICacheEntry | null> {
    const row = await prisma.aICache.findUnique({ where: { hash } });
    if (!row) return null;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
    return {
      hash: row.hash,
      kind: row.kind,
      locale: row.locale,
      persona: row.persona,
      prompt: row.prompt,
      response: row.response,
      tokensIn: row.tokensIn ?? undefined,
      tokensOut: row.tokensOut ?? undefined,
      hits: row.hits,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    };
  }

  async save(entry: NewAICacheEntry): Promise<void> {
    await prisma.aICache.upsert({
      where: { hash: entry.hash },
      create: {
        hash: entry.hash,
        kind: entry.kind,
        locale: entry.locale,
        persona: entry.persona ?? null,
        prompt: entry.prompt,
        response: entry.response as object,
        tokensIn: entry.tokensIn,
        tokensOut: entry.tokensOut,
        expiresAt: entry.expiresAt ?? null,
      },
      update: {
        response: entry.response as object,
        tokensIn: entry.tokensIn,
        tokensOut: entry.tokensOut,
        expiresAt: entry.expiresAt ?? null,
      },
    });
  }

  async incrementHits(hash: string): Promise<void> {
    await prisma.aICache.update({ where: { hash }, data: { hits: { increment: 1 } } });
  }

  async purgeExpired(): Promise<number> {
    const { count } = await prisma.aICache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return count;
  }
}
