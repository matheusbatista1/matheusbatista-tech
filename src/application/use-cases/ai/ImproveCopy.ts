import type { Locale } from "@/domain/value-objects/Locale";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import type { IRateLimiter } from "@/application/ports/IRateLimiter";
import {
  ImproveCopyOutputSchema,
  type ImproveCopyOutputSchemaType,
  type ImproveCopyTone,
} from "@/application/ai/schemas/improve-copy";
import { buildImproveCopyPrompt } from "@/application/ai/prompts/improve-copy";
import { LogActivity } from "@/application/use-cases/activity/LogActivity";
import { hashCacheKey } from "./cache-key";
import { PROMPT_VERSION, sanitizeAIText } from "@/application/ai/prompts/voice";
import type { LogAIUsage } from "@/application/use-cases/analytics/LogAIUsage";

const KIND = "improve-copy";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const MAX_OUTPUT_TOKENS = 1000;

export interface ImproveCopyInput {
  text: string;
  tone?: ImproveCopyTone;
  locale: Locale;
  actorEmail?: string | null;
  ip?: string | null;
}

export interface ImproveCopyResult {
  improved: string;
  notes?: string;
  cached: boolean;
}

export class ImproveCopy {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly cacheRepo: IAICacheRepository,
    // Reservado para uso futuro (rate limit interno ao use case);
    // hoje o gate fica no route handler. Recebido por contrato.
    private readonly _rateLimiter: IRateLimiter,
    private readonly logActivity: LogActivity,
    private readonly logAIUsage?: LogAIUsage,
  ) {}

  async execute(input: ImproveCopyInput): Promise<ImproveCopyResult> {
    const { text, tone, locale, actorEmail, ip } = input;
    const normalizedText = text.trim();

    const hash = await hashCacheKey(KIND, {
      kind: KIND,
      locale,
      persona: tone ?? "neutral",
      query: normalizedText,
      v: PROMPT_VERSION,
    });

    const started = performance.now();
    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      const response = cached.response as ImproveCopyOutputSchemaType;
      await this.logActivity.execute({
        actorEmail: actorEmail ?? null,
        action: "ai_apply",
        entity: "about",
        diff: { feature: KIND, tone: tone ?? null, locale, cached: true },
        ip: ip ?? null,
      });
      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale,
          persona: tone ?? null,
          ip: ip ?? "unknown",
          cached: true,
          durationMs: Math.round(performance.now() - started),
          status: "ok",
        });
      } catch {
        /* best-effort */
      }
      return { improved: response.improved, notes: response.notes, cached: true };
    }

    const prompt = buildImproveCopyPrompt({ text: normalizedText, locale, tone });

    try {
      const raw = await this.aiProvider.generateJSON({
        prompt,
        schema: ImproveCopyOutputSchema,
        maxTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
      });

      const response: ImproveCopyOutputSchemaType = {
        ...raw,
        improved: sanitizeAIText(raw.improved),
      };

      await this.cacheRepo.save({
        hash,
        kind: KIND,
        locale,
        persona: tone ?? null,
        prompt,
        response,
        expiresAt: new Date(Date.now() + TTL_MS),
      });

      await this.logActivity.execute({
        actorEmail: actorEmail ?? null,
        action: "ai_apply",
        entity: "about",
        diff: { feature: KIND, tone: tone ?? null, locale, cached: false },
        ip: ip ?? null,
      });

      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale,
          persona: tone ?? null,
          ip: ip ?? "unknown",
          cached: false,
          durationMs: Math.round(performance.now() - started),
          status: "ok",
        });
      } catch {
        /* best-effort */
      }

      return { improved: response.improved, notes: response.notes, cached: false };
    } catch (err) {
      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale,
          persona: tone ?? null,
          ip: ip ?? "unknown",
          cached: false,
          durationMs: Math.round(performance.now() - started),
          status: "error",
        });
      } catch {
        /* best-effort */
      }
      throw err;
    }
  }
}
