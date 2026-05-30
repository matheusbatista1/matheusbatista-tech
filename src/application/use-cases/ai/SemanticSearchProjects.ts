import { z } from "zod";
import type { Locale } from "@/domain/value-objects/Locale";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import { BuildPromptContext } from "./BuildPromptContext";
import { computeContentFingerprint, hashCacheKey } from "./cache-key";

const KIND = "semantic-search";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const SearchRankedSchema = z.object({
  ranked: z.array(z.object({ id: z.string(), reason: z.string().max(80) })),
});

export type SemanticSearchResult = z.infer<typeof SearchRankedSchema>;

export interface SemanticSearchProjectsInput {
  query: string;
  locale: Locale;
}

export interface SemanticSearchProjectsResult {
  ranked: SemanticSearchResult["ranked"];
  cached: boolean;
}

export class SemanticSearchProjects {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly buildContext: BuildPromptContext,
    private readonly cacheRepo: IAICacheRepository,
  ) {}

  async execute({
    query,
    locale,
  }: SemanticSearchProjectsInput): Promise<SemanticSearchProjectsResult> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return { ranked: [], cached: false };

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
      locale,
      query: normalizedQuery,
      content: fingerprint,
    });

    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      const response = cached.response as SemanticSearchResult;
      return { ranked: response.ranked, cached: true };
    }

    const projectsPayload = context.projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      tags: p.tags,
    }));

    const prompt = [
      `Rank these projects by how well they match the query, semantically (not just keywords).`,
      `QUERY: ${JSON.stringify(normalizedQuery)}`,
      `PROJECTS (JSON): ${JSON.stringify(projectsPayload)}`,
      ``,
      `Return COMPACT JSON only: {"ranked":[{"id":"<id>","reason":"<=8 words why it matches"}]}`,
      `Only include projects with a real match (can be fewer than all). Best first.`,
      `Use project ids exactly as in PROJECTS.`,
    ].join("\n");

    const response = await this.aiProvider.generateJSON({
      prompt,
      schema: SearchRankedSchema,
    });

    await this.cacheRepo.save({
      hash,
      kind: KIND,
      locale,
      prompt,
      response,
      expiresAt: new Date(Date.now() + TTL_MS),
    });

    return { ranked: response.ranked, cached: false };
  }
}
