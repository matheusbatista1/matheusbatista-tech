import { z } from "zod";
import type { Locale } from "@/domain/value-objects/Locale";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { PersonaCopyOverride } from "@/domain/entities/ai/PromptContext";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import { BuildPromptContext } from "./BuildPromptContext";
import { computeContentFingerprint, hashCacheKey } from "./cache-key";

const KIND = "persona-adapt";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PERSONA_DESCRIPTIONS: Record<PersonaId, { label: string; hint: string }> = {
  default: { label: "Visitor", hint: "Balanced overview" },
  recruiter: { label: "Recruiter", hint: "Soft skills, impact, availability" },
  techlead: { label: "Tech Lead", hint: "Hard skills, architecture, delivery" },
  cto: { label: "CTO / Founder", hint: "Business impact, scale, ownership" },
  designer: { label: "Designer", hint: "Craft, UX sensibility, collaboration" },
};

const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

const PersonaCopySchema = z.object({
  tagline: z.string(),
  about: z.string(),
  projects: z.array(z.object({ id: z.string(), description: z.string() })),
});

export interface AdaptPersonaCopyInput {
  persona: PersonaId;
  locale: Locale;
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
  ) {}

  async execute({ persona, locale }: AdaptPersonaCopyInput): Promise<AdaptPersonaCopyResult> {
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
    });

    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      return { copy: cached.response as PersonaCopyOverride, cached: true };
    }

    const personaInfo = PERSONA_DESCRIPTIONS[persona];
    const langName = LANG_LABEL[locale];

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
      `Rewrite this engineer's portfolio copy for a specific reader.`,
      `Reader: "${personaInfo.label}" — ${personaInfo.hint}.`,
      `Keep it truthful to the facts; only shift emphasis & tone. Keep lengths similar.`,
      `WRITE IN ${langName}.`,
      ``,
      `FACTS (JSON):`,
      JSON.stringify(facts),
      ``,
      `Return COMPACT JSON only:`,
      `{"tagline":"one punchy line","about":"1 short paragraph (2-3 sentences)","projects":[{"id":"<id>","description":"reframed 1-2 sentence description"}]}`,
      `Use project ids exactly as in FACTS.`,
    ].join("\n");

    const copy = await this.aiProvider.generateJSON({
      prompt,
      schema: PersonaCopySchema,
    });

    await this.cacheRepo.save({
      hash,
      kind: KIND,
      locale,
      persona,
      prompt,
      response: copy,
      expiresAt: new Date(Date.now() + TTL_MS),
    });

    return { copy, cached: false };
  }
}
