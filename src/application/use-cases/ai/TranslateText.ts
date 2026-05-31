import type { Locale } from "@/domain/value-objects/Locale";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import type { IRateLimiter } from "@/application/ports/IRateLimiter";
import { TranslateOutputSchema, type TranslateOutput } from "@/application/ai/schemas/translate";
import { buildTranslatePrompt } from "@/application/ai/prompts/translate";
import { hashCacheKey } from "./cache-key";
import type { LogActivity } from "../activity/LogActivity";

const KIND = "translate-text";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias
const MAX_OUTPUT_TOKENS = 1000;

export interface TranslateTextInput {
  text: string;
  from?: Locale;
  targets: Locale[];
  actorId?: string | null;
  actorEmail?: string | null;
  ip?: string | null;
}

export interface TranslateTextResult {
  translated: TranslateOutput["translated"];
  cached: boolean;
}

export class TranslateText {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly cacheRepo: IAICacheRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: TranslateTextInput): Promise<TranslateTextResult> {
    const normalizedText = input.text.trim().replace(/\s+/g, " ");
    if (!normalizedText) {
      return { translated: {}, cached: false };
    }

    const uniqueTargets = Array.from(new Set(input.targets)).sort();
    // O "locale" canônico do cache é o source; targets entram na chave como lista ordenada.
    const cacheLocale: Locale = input.from ?? "en";
    const hash = await hashCacheKey(KIND, {
      from: input.from ?? "auto",
      targets: uniqueTargets.join(","),
      query: normalizedText,
    });

    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      const response = cached.response as TranslateOutput;
      return { translated: response.translated, cached: true };
    }

    const prompt = buildTranslatePrompt({
      text: normalizedText,
      from: input.from,
      targets: uniqueTargets,
    });

    const response = await this.aiProvider.generateJSON({
      prompt,
      schema: TranslateOutputSchema,
      maxTokens: MAX_OUTPUT_TOKENS,
    });

    // Garante que só locales requisitados aparecem (defense-in-depth caso o modelo
    // devolva chaves extras).
    const translated: TranslateOutput["translated"] = {};
    for (const target of uniqueTargets) {
      const value = response.translated[target];
      if (typeof value === "string" && value.trim().length > 0) {
        translated[target] = value;
      }
    }

    await this.cacheRepo.save({
      hash,
      kind: KIND,
      locale: cacheLocale,
      prompt,
      response: { translated },
      expiresAt: new Date(Date.now() + TTL_MS),
    });

    await this.logActivity.execute({
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: "ai_apply",
      entity: "settings",
      entityId: KIND,
      diff: {
        kind: KIND,
        from: input.from ?? null,
        targets: uniqueTargets,
        chars: normalizedText.length,
      },
      ip: input.ip ?? null,
    });

    return { translated, cached: false };
  }
}
