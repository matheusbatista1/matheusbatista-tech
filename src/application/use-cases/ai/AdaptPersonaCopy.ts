import { z } from "zod";
import type { Locale } from "@/domain/value-objects/Locale";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { PersonaCopyOverride } from "@/domain/entities/ai/PromptContext";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import { BuildPromptContext } from "./BuildPromptContext";
import { computeContentFingerprint, hashCacheKey } from "./cache-key";
import {
  PERSONA_VOICE,
  PROMPT_VERSION,
  globalStyle,
  sanitizeAIText,
} from "@/application/ai/prompts/voice";
import type { LogAIUsage } from "@/application/use-cases/analytics/LogAIUsage";

const KIND = "persona-adapt";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PersonaCopySchema = z.object({
  tagline: z.string(),
  about: z.string(),
  projects: z.array(z.object({ id: z.string(), description: z.string() })),
});

export interface AdaptPersonaCopyInput {
  persona: PersonaId;
  locale: Locale;
  ip?: string;
}

export interface AdaptPersonaCopyResult {
  copy: PersonaCopyOverride | null;
  cached: boolean;
}

export class AdaptPersonaCopy {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly buildContext: BuildPromptContext,
    private readonly cacheRepo: IAICacheRepository,
    private readonly logAIUsage?: LogAIUsage,
  ) {}

  async execute({ persona, locale, ip }: AdaptPersonaCopyInput): Promise<AdaptPersonaCopyResult> {
    if (persona === "default") {
      return { copy: null, cached: false };
    }

    const context = await this.buildContext.execute(locale);
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
    const hash = await hashCacheKey(KIND, {
      persona,
      locale,
      content: fingerprint,
      v: PROMPT_VERSION,
    });

    const started = performance.now();
    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale,
          persona,
          ip: ip ?? "unknown",
          cached: true,
          durationMs: Math.round(performance.now() - started),
          status: "ok",
        });
      } catch {
        /* best-effort */
      }
      return { copy: cached.response as PersonaCopyOverride, cached: true };
    }

    const personaInfo = PERSONA_VOICE[persona];

    const facts = {
      name: context.name,
      subtitle: context.subtitle,
      tagline: context.tagline,
      about: context.about,
      skills: context.skills,
      projects: context.projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
      })),
    };

    const prompt = [
      `Rewrite ${context.name}'s portfolio copy for a specific reader, without losing any depth.`,
      `Reader: ${personaInfo.label}. ${personaInfo.focus}`,
      ``,
      globalStyle(locale),
      `- "tagline": ONE short line, about the same length as the original tagline. Do NOT expand it into multiple sentences.`,
      `- "about": keep the same depth and length as the original about, reframed for this reader. Do not shorten.`,
      `- "projects": rewrite each description with at least as much detail as the original. Do not shorten.`,
      ``,
      `FACTS (JSON):`,
      JSON.stringify(facts),
      ``,
      `Return JSON only with this shape, using the same project ids as in FACTS:`,
      `{"tagline": string, "about": string, "projects": [{"id": string, "description": string}]}`,
    ].join("\n");

    try {
      const raw = await this.aiProvider.generateJSON({
        prompt,
        schema: PersonaCopySchema,
        temperature: 0.85,
      });

      const copy: PersonaCopyOverride = {
        tagline: sanitizeAIText(raw.tagline),
        about: sanitizeAIText(raw.about),
        projects: raw.projects.map((p) => ({
          id: p.id,
          description: sanitizeAIText(p.description),
        })),
      };

      await this.cacheRepo.save({
        hash,
        kind: KIND,
        locale,
        persona,
        prompt,
        response: copy,
        expiresAt: new Date(Date.now() + TTL_MS),
      });

      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale,
          persona,
          ip: ip ?? "unknown",
          cached: false,
          durationMs: Math.round(performance.now() - started),
          status: "ok",
        });
      } catch {
        /* best-effort */
      }

      return { copy, cached: false };
    } catch (err) {
      try {
        await this.logAIUsage?.execute({
          kind: KIND,
          locale,
          persona,
          ip: ip ?? "unknown",
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
