import { z } from "zod";
import type { Locale } from "@/domain/value-objects/Locale";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { ChatResponse } from "@/domain/entities/ai/AIBlock";
import type { IAIProvider } from "@/application/ports/IAIProvider";
import type { IAICacheRepository } from "@/domain/repositories/IAICacheRepository";
import { BuildPromptContext } from "./BuildPromptContext";
import { hashCacheKey } from "./cache-key";

const KIND = "chat";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PERSONA_HINT: Record<PersonaId, string> = {
  default: "balanced overview",
  recruiter: "impact & soft skills",
  techlead: "architecture & stack",
  cto: "business value & scale",
  designer: "craft & UX",
};

const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

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
  reply: z.string().max(300),
  blocks: z.array(AIBlockSchema).max(1),
});

export interface ChatWithAssistantInput {
  question: string;
  persona: PersonaId;
  locale: Locale;
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
  ) {}

  async execute({
    question,
    persona,
    locale,
  }: ChatWithAssistantInput): Promise<ChatWithAssistantResult> {
    const normalizedQuestion = question.trim();
    const hash = await hashCacheKey(KIND, {
      persona,
      locale,
      query: normalizedQuestion,
    });

    const cached = await this.cacheRepo.findByHash(hash);
    if (cached) {
      await this.cacheRepo.incrementHits(hash);
      return { response: cached.response as ChatResponse, cached: true };
    }

    const context = await this.buildContext.execute(locale);
    const personaHint = PERSONA_HINT[persona];
    const langName = LANG_LABEL[locale];

    const prompt = [
      `You are the AI guide on the portfolio of ${context.name}, a software engineer.`,
      `Answer using ONLY the data below.`,
      `Visitor persona: "${persona}" — tailor emphasis (${personaHint}).`,
      `WRITE THE "reply" IN ${langName}.`,
      ``,
      `DATA (JSON):`,
      JSON.stringify(context),
      ``,
      `Question: ${normalizedQuestion}`,
      ``,
      `Reply with COMPACT JSON only. "reply" under 30 words, AT MOST 1 block.`,
      `Use project ids exactly as in DATA. Omit blocks entirely if none fit (empty array).`,
      `block.type is one of: "skills-chart" | "skill-chips" | "project" | "projects" | "contact" | "stats" | "timeline" | "text".`,
    ].join("\n");

    const response = await this.aiProvider.generateJSON({
      prompt,
      schema: ChatResponseSchema,
    });

    await this.cacheRepo.save({
      hash,
      kind: KIND,
      locale,
      persona,
      prompt,
      response,
      expiresAt: new Date(Date.now() + TTL_MS),
    });

    return { response, cached: false };
  }
}
