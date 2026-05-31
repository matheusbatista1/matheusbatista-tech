import type { Locale } from "@/domain/value-objects/Locale";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import type { IRateLimiter } from "@/application/ports/IRateLimiter";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import { DraftReplySchema, type DraftReplySchemaType } from "@/application/ai/schemas/draft-reply";
import { buildDraftReplyPrompt, type DraftReplyTone } from "@/application/ai/prompts/draft-reply";
import { BuildPromptContext } from "./BuildPromptContext";
import { hashCacheKey } from "./cache-key";
import { LogActivity } from "../activity/LogActivity";

const KIND = "draft-reply";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAX_OUTPUT_TOKENS = 1000;
const DEFAULT_TONE: DraftReplyTone = "professional";

export interface DraftReplyToMessageInput {
  messageId: string;
  tone?: DraftReplyTone;
  locale?: Locale;
  actorId?: string | null;
  actorEmail?: string | null;
  ip?: string | null;
}

export interface DraftReplyToMessageResult {
  draft: DraftReplySchemaType;
  cached: boolean;
}

export class MessageNotFoundError extends Error {
  readonly code = "MESSAGE_NOT_FOUND";
  constructor(messageId: string) {
    super(`Contact message not found: ${messageId}`);
  }
}

/**
 * Gera um rascunho de resposta a uma ContactMessage usando IA.
 *
 * Fluxo:
 * - Busca a mensagem; se nao existir -> MessageNotFoundError.
 * - Tenta cache-first (hash sha256 sobre kind+locale+tone+conteudo).
 * - Monta prompt com author facts + mensagem recebida + tone.
 * - Chama provider.generateJSON com maxTokens=1000.
 * - Persiste no cache e loga ai_apply em message<entityId=messageId>.
 */
export class DraftReplyToMessage {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly cacheRepo: IAICacheRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly logActivity: LogActivity,
    private readonly buildContext: BuildPromptContext,
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute({
    messageId,
    tone = DEFAULT_TONE,
    locale = "en",
    actorId,
    actorEmail,
    ip,
  }: DraftReplyToMessageInput): Promise<DraftReplyToMessageResult> {
    const message = await this.messageRepo.findById(messageId);
    if (!message) {
      throw new MessageNotFoundError(messageId);
    }

    const queryNormalized = [
      `tone=${tone}`,
      `from=${message.from.trim().toLowerCase()}`,
      `subject=${(message.subject ?? "").trim().toLowerCase()}`,
      `body=${message.body.trim()}`,
    ].join("|");

    const hash = await hashCacheKey(KIND, {
      locale,
      persona: tone,
      query: queryNormalized,
    });

    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      const draft = cached.response as DraftReplySchemaType;
      await this.logActivity.execute({
        actorId: actorId ?? null,
        actorEmail: actorEmail ?? null,
        action: "ai_apply",
        entity: "message",
        entityId: messageId,
        diff: { feature: "draft-reply", tone, locale, cached: true },
        ip: ip ?? null,
      });
      return { draft, cached: true };
    }

    // Defense-in-depth: per-message throttle on cache miss. Routes already
    // gate per IP; this avoids re-generating the same draft repeatedly.
    const rl = await this.rateLimiter.limit(`draft-reply:${messageId}`);
    if (!rl.success) {
      const err = new Error("Rate limit exceeded");
      (err as Error & { code?: string }).code = "RATE_LIMITED";
      throw err;
    }

    const context = await this.buildContext.execute(locale);
    const prompt = buildDraftReplyPrompt({
      context,
      locale,
      tone,
      message: { from: message.from, subject: message.subject, body: message.body },
    });

    const draft = await this.aiProvider.generateJSON({
      prompt,
      schema: DraftReplySchema,
      maxTokens: MAX_OUTPUT_TOKENS,
    });

    await this.cacheRepo.save({
      hash,
      kind: KIND,
      locale,
      persona: tone,
      prompt,
      response: draft,
      expiresAt: new Date(Date.now() + TTL_MS),
    });

    await this.logActivity.execute({
      actorId: actorId ?? null,
      actorEmail: actorEmail ?? null,
      action: "ai_apply",
      entity: "message",
      entityId: messageId,
      diff: { feature: "draft-reply", tone, locale, cached: false },
      ip: ip ?? null,
    });

    return { draft, cached: false };
  }
}
