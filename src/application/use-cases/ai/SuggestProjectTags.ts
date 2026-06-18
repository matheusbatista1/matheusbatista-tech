import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import type { IRateLimiter } from "@/application/ports/IRateLimiter";
import { BuildPromptContext } from "./BuildPromptContext";
import { LogActivity } from "@/application/use-cases/activity/LogActivity";
import { computeContentFingerprint, hashCacheKey } from "./cache-key";
import {
  SuggestTagsSchema,
  type SuggestTagsSchemaType,
} from "@/application/ai/schemas/suggest-tags";
import { buildSuggestTagsPrompt } from "@/application/ai/prompts/suggest-tags";
import type { LogAIUsage } from "@/application/use-cases/analytics/LogAIUsage";

const KIND = "suggest-tags";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const MAX_OUTPUT_TOKENS = 1000;

export interface SuggestProjectTagsInput {
  name: string;
  description: string;
  actorEmail?: string | null;
  actorId?: string | null;
  ip?: string | null;
}

export interface SuggestProjectTagsResult {
  tags: string[];
  cached: boolean;
}

export class SuggestProjectTags {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly cacheRepo: IAICacheRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly logActivity: LogActivity,
    private readonly buildContext: BuildPromptContext,
    private readonly logAIUsage?: LogAIUsage,
  ) {}

  async execute(input: SuggestProjectTagsInput): Promise<SuggestProjectTagsResult> {
    const name = input.name.trim();
    const description = input.description.trim();

    const context = await this.buildContext.execute("en");
    const fingerprint = await computeContentFingerprint({
      tagline: context.tagline,
      about: context.about,
      currently: context.currently,
      projects: context.projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        tags: p.tags,
      })),
      skills: context.skills,
    });

    const queryNormalized = JSON.stringify({ name, description });

    const hash = await hashCacheKey(KIND, {
      locale: "multi",
      persona: "admin",
      query: queryNormalized,
      content: fingerprint,
    });

    const started = performance.now();
    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      const cachedResponse = cached.response as SuggestTagsSchemaType;
      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale: "en",
          persona: "admin",
          ip: input.ip ?? "unknown",
          cached: true,
          durationMs: Math.round(performance.now() - started),
          status: "ok",
        });
      } catch {
        /* best-effort */
      }
      return { tags: cachedResponse.tags, cached: true };
    }

    const prompt = buildSuggestTagsPrompt({ name, description, context });

    try {
      const result = await this.aiProvider.generateJSON({
        prompt,
        schema: SuggestTagsSchema,
        maxTokens: MAX_OUTPUT_TOKENS,
      });

      const normalizedTags = Array.from(
        new Set(result.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)),
      ).slice(0, 6);

      const finalResponse: SuggestTagsSchemaType = { tags: normalizedTags };

      await this.cacheRepo.save({
        hash,
        kind: KIND,
        locale: "multi",
        persona: "admin",
        prompt,
        response: finalResponse,
        expiresAt: new Date(Date.now() + TTL_MS),
      });

      await this.logActivity.execute({
        actorEmail: input.actorEmail ?? null,
        actorId: input.actorId ?? null,
        action: "ai_apply",
        entity: "project",
        diff: { kind: KIND, name },
        ip: input.ip ?? null,
      });

      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale: "en",
          persona: "admin",
          ip: input.ip ?? "unknown",
          cached: false,
          durationMs: Math.round(performance.now() - started),
          status: "ok",
        });
      } catch {
        /* best-effort */
      }

      return { tags: normalizedTags, cached: false };
    } catch (err) {
      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale: "en",
          persona: "admin",
          ip: input.ip ?? "unknown",
          cached: false,
          durationMs: Math.round(performance.now() - started),
          status: "error",
          error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
        });
      } catch {
        /* best-effort */
      }
      throw err;
    }
  }
}
