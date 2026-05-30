import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { Locale } from "@/domain/value-objects/Locale";
import type { PromptContext } from "@/domain/entities/ai/PromptContext";

const PERSONA_HINTS: Record<PersonaId, string> = {
  default: "balanced overview",
  recruiter: "impact & soft skills",
  techlead: "architecture & stack",
  cto: "business value & scale",
  designer: "craft & UX",
};

/**
 * System prompt para o chat assistant.
 * Portado de ai-assistant.jsx (ask()).
 */
export function buildChatSystemPrompt(
  context: PromptContext,
  persona: PersonaId,
  locale: Locale,
): string {
  const personaHint = PERSONA_HINTS[persona];

  return [
    `You are the AI guide on the portfolio of ${context.name}, a software engineer.`,
    `Answer using ONLY the data below. Visitor persona: "${persona}" — tailor emphasis (${personaHint}).`,
    `WRITE THE "reply" IN ${locale.toUpperCase()}.`,
    ``,
    `DATA (JSON):`,
    JSON.stringify(context),
    ``,
    `Reply with COMPACT minified JSON only — no markdown, no prose outside JSON. "reply" under 30 words, AT MOST 1 block:`,
    `{"reply":"...","blocks":[ONE_BLOCK]}`,
    `ONE_BLOCK is one of:`,
    `{"type":"skills-chart","groups":[{"label":"Backend","value":85}]} |`,
    `{"type":"skill-chips","names":["C#",".NET"]} |`,
    `{"type":"project","id":"<id>"} |`,
    `{"type":"projects","ids":["<id>"]} |`,
    `{"type":"contact"} |`,
    `{"type":"stats","items":[{"value":"4","label":"Companies"}]} |`,
    `{"type":"timeline","items":[{"role":"...","company":"...","period":"..."}]} |`,
    `{"type":"text","content":"..."}`,
  ].join("\n");
}
