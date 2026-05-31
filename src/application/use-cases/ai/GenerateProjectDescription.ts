import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import type { IRateLimiter } from "@/application/ports/IRateLimiter";
import { BuildPromptContext } from "./BuildPromptContext";
import { LogActivity } from "@/application/use-cases/activity/LogActivity";
import { computeContentFingerprint, hashCacheKey } from "./cache-key";
import {
  ProjectDescriptionSchema,
  type ProjectDescriptionSchemaType,
} from "@/application/ai/schemas/project-description";
import { buildProjectDescriptionPrompt } from "@/application/ai/prompts/project-description";
import type { LogAIUsage } from "@/application/use-cases/analytics/LogAIUsage";

const KIND = "project-description";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const MAX_OUTPUT_TOKENS = 1000;

export interface GenerateProjectDescriptionInput {
  name: string;
  tags: string[];
  url?: string;
  hint?: string;
  /** Admin actor email for audit log (optional). */
  actorEmail?: string | null;
  actorId?: string | null;
  ip?: string | null;
}

export interface GenerateProjectDescriptionResult {
  description: ProjectDescriptionSchemaType["description"];
  tagline?: string;
  cached: boolean;
}

export class GenerateProjectDescription {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly cacheRepo: IAICacheRepository,
    private readonly rateLimiter: IRateLimiter,
    private readonly logActivity: LogActivity,
    private readonly buildContext: BuildPromptContext,
    private readonly logAIUsage?: LogAIUsage,
  ) {}

  async execute(input: GenerateProjectDescriptionInput): Promise<GenerateProjectDescriptionResult> {
    const name = input.name.trim();
    const tags = [...input.tags]
      .map((t) => t.trim())
      .filter(Boolean)
      .sort();
    const url = input.url?.trim() || undefined;
    const hint = input.hint?.trim() || undefined;

    // Use EN context as tone reference (locale-agnostic feature, output is multi-locale)
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

    const queryNormalized = JSON.stringify({ name, tags, url: url ?? "", hint: hint ?? "" });

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
      const cachedResponse = cached.response as ProjectDescriptionSchemaType;
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
      return {
        description: cachedResponse.description,
        tagline: cachedResponse.tagline,
        cached: true,
      };
    }

    const prompt = buildProjectDescriptionPrompt({ name, tags, url, hint, context });

    try {
      const result = await this.aiProvider.generateJSON({
        prompt,
        schema: ProjectDescriptionSchema,
        maxTokens: MAX_OUTPUT_TOKENS,
      });

      await this.cacheRepo.save({
        hash,
        kind: KIND,
        locale: "multi",
        persona: "admin",
        prompt,
        response: result,
        expiresAt: new Date(Date.now() + TTL_MS),
      });

      await this.logActivity.execute({
        actorEmail: input.actorEmail ?? null,
        actorId: input.actorId ?? null,
        action: "ai_apply",
        entity: "project",
        diff: { kind: KIND, name, tags },
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

      return {
        description: result.description,
        tagline: result.tagline,
        cached: false,
      };
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
        });
      } catch {
        /* best-effort */
      }
      throw err;
    }
  }
}
