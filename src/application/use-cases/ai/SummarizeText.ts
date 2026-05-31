import type { Locale } from "@/domain/value-objects/Locale";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import type { IRateLimiter } from "@/application/ports/IRateLimiter";
import { SummarizeOutputSchema } from "@/application/ai/schemas/summarize";
import { buildSummarizePrompt } from "@/application/ai/prompts/summarize";
import { hashCacheKey } from "./cache-key";
import { LogActivity } from "../activity/LogActivity";

const KIND = "summarize";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const DEFAULT_MAX_WORDS = 40;
const MAX_OUTPUT_TOKENS = 1000;

export interface SummarizeTextInput {
  text: string;
  maxWords?: number;
  locale: Locale;
  actorEmail?: string | null;
  actorId?: string | null;
  ip?: string | null;
}

export interface SummarizeTextResult {
  summary: string;
  cached: boolean;
}

export class SummarizeText {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly cacheRepo: IAICacheRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly logActivity: LogActivity,
  ) {}

  async execute({
    text,
    maxWords,
    locale,
    actorEmail,
    actorId,
    ip,
  }: SummarizeTextInput): Promise<SummarizeTextResult> {
    const normalizedText = text.trim();
    const effectiveMaxWords = maxWords ?? DEFAULT_MAX_WORDS;

    const hash = await hashCacheKey(KIND, {
      locale,
      persona: "default",
      query: `w=${effectiveMaxWords}|t=${normalizedText}`,
    });

    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      const response = cached.response as { summary: string };
      return { summary: response.summary, cached: true };
    }

    // Defensive rate-limit barrier at the use-case layer (routes also gate).
    if (ip) {
      const rl = await this.rateLimiter.limit(`summarize:${ip}`);
      if (!rl.success) {
        throw new Error("Rate limit exceeded");
      }
    }

    const prompt = buildSummarizePrompt(normalizedText, effectiveMaxWords, locale);

    const response = await this.aiProvider.generateJSON({
      prompt,
      schema: SummarizeOutputSchema,
      maxTokens: MAX_OUTPUT_TOKENS,
    });

    await this.cacheRepo.save({
      hash,
      kind: KIND,
      locale,
      prompt,
      response,
      expiresAt: new Date(Date.now() + TTL_MS),
    });

    await this.logActivity.execute({
      actorId: actorId ?? null,
      actorEmail: actorEmail ?? null,
      action: "ai_apply",
      entity: "settings",
      diff: { feature: "summarize", locale, maxWords: effectiveMaxWords },
      ip: ip ?? null,
    });

    return { summary: response.summary, cached: false };
  }
}
