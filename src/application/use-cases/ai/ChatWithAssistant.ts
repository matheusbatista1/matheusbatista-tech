import { z } from "zod";
import type { Locale } from "@/domain/value-objects/Locale";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { ChatResponse } from "@/domain/entities/ai/AIBlock";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import { BuildPromptContext } from "./BuildPromptContext";
import { computeContentFingerprint, hashCacheKey } from "./cache-key";
import {
  LANG_LABEL,
  PERSONA_VOICE,
  PROMPT_VERSION,
  globalStyle,
  sanitizeAIText,
} from "@/application/ai/prompts/voice";
import type { LogAIUsage } from "@/application/use-cases/analytics/LogAIUsage";

const KIND = "chat";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const AIBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("skills-chart"),
    groups: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
  z.object({ type: z.literal("skill-chips"), names: z.array(z.string()) }),
  z.object({ type: z.literal("project"), id: z.string() }),
  z.object({ type: z.literal("projects"), ids: z.array(z.string()) }),
  z.object({ type: z.literal("contact") }),
  z.object({
    type: z.literal("stats"),
    items: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  z.object({
    type: z.literal("timeline"),
    items: z.array(
      z.object({
        role: z.string(),
        company: z.string(),
        period: z.string(),
        note: z.string().optional(),
      }),
    ),
  }),
  z.object({ type: z.literal("text"), content: z.string() }),
]);

const ChatResponseSchema = z.object({
  reply: z.string().max(700),
  blocks: z.array(AIBlockSchema).max(1),
  suggestions: z.array(z.string().max(120)).max(4),
});

export interface ChatWithAssistantInput {
  question: string;
  persona: PersonaId;
  locale: Locale;
  ip?: string;
}

export interface ChatWithAssistantResult {
  response: ChatResponse;
  cached: boolean;
}

export class ChatWithAssistant {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly buildContext: BuildPromptContext,
    private readonly cacheRepo: IAICacheRepository,
    private readonly logAIUsage?: LogAIUsage,
  ) {}

  async execute({
    question,
    persona,
    locale,
    ip,
  }: ChatWithAssistantInput): Promise<ChatWithAssistantResult> {
    const normalizedQuestion = question.trim();
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
      query: normalizedQuestion,
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
      return { response: cached.response as ChatResponse, cached: true };
    }

    const personaVoice = PERSONA_VOICE[persona];
    const langName = LANG_LABEL[locale];

    const prompt = [
      `You are the AI guide on ${context.name}'s portfolio, a software engineer. Answer visitor questions about him using ONLY the data below.`,
      `Visitor: ${personaVoice.label}. ${personaVoice.focus}`,
      ``,
      globalStyle(locale),
      `- Write the "reply" in ${langName}. Keep it tight and natural, up to about 80 words. Answer the question directly and with conviction.`,
      ``,
      `DATA (JSON):`,
      JSON.stringify(context),
      ``,
      `Question: ${normalizedQuestion}`,
      ``,
      `Reply with JSON only. Use AT MOST 1 block, and omit blocks entirely when none fits (empty array).`,
      `Use project ids exactly as in DATA.`,
      `block.type is one of: "skills-chart" | "skill-chips" | "project" | "projects" | "contact" | "stats" | "timeline" | "text".`,
      `Also return "suggestions": 3 to 4 short follow-up questions (max ~10 words each) the visitor would naturally ask next, in ${langName}. Write them the way a visitor refers to him (third person, e.g. "What are his strongest skills?"), make them flow from this answer, and never repeat the question just asked.`,
    ].join("\n");

    try {
      const raw = await this.aiProvider.generateJSON({
        prompt,
        schema: ChatResponseSchema,
        temperature: 0.8,
      });

      const response: ChatResponse = {
        reply: sanitizeAIText(raw.reply),
        blocks: raw.blocks.map((b) =>
          b.type === "text" ? { ...b, content: sanitizeAIText(b.content) } : b,
        ),
        suggestions: raw.suggestions.map((s) => sanitizeAIText(s)).filter(Boolean),
      };

      await this.cacheRepo.save({
        hash,
        kind: KIND,
        locale,
        persona,
        prompt,
        response,
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

      return { response, cached: false };
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
        });
      } catch {
        /* best-effort */
      }
      throw err;
    }
  }
}
