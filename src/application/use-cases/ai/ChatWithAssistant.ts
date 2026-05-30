import type { Locale } from "@/domain/value-objects/Locale";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { ChatMessage } from "@/domain/entities/ai/ChatMessage";
import type { IAIProvider, StreamTextResult } from "@/application/ports/IAIProvider";
import { BuildPromptContext } from "./BuildPromptContext";

export interface ChatWithAssistantInput {
  messages: ChatMessage[];
  persona: PersonaId;
  locale: Locale;
}

/**
 * Stream-based chat. Cache acontece no client (localStorage) e no servidor
 * apenas para o block final via onFinish do handler — não no use case.
 *
 * TODO(prompt): portar o system prompt completo de ai-assistant.jsx (ask())
 * com instruções de formato JSON e exemplos de blocks.
 */
export class ChatWithAssistant {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly buildContext: BuildPromptContext,
  ) {}

  async execute(input: ChatWithAssistantInput): Promise<StreamTextResult> {
    const context = await this.buildContext.execute(input.locale);

    const system = [
      `You are the AI guide on the portfolio of ${context.name}, a software engineer.`,
      `Answer using ONLY the data provided.`,
      `Visitor persona: "${input.persona}" — tailor emphasis (recruiter: impact & soft skills; tech lead: architecture & stack; CTO: business value & scale; designer: craft & UX).`,
      `Reply in ${input.locale.toUpperCase()}. Keep answers under 30 words.`,
      ``,
      `DATA (JSON):`,
      JSON.stringify(context),
    ].join("\n");

    return this.aiProvider.streamText({
      messages: input.messages,
      system,
    });
  }
}
