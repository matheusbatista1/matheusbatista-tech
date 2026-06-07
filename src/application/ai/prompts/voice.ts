import type { Locale } from "@/domain/value-objects/Locale";
import type { PersonaId } from "@/domain/entities/ai/Persona";

/**
 * Versão dos prompts/estilo de geração. Entra na chave de cache de IA para
 * invalidar respostas antigas sempre que a voz ou as instruções mudarem.
 */
export const PROMPT_VERSION = "2";

export const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

/**
 * Regras de estilo aplicadas a TODA geração de texto do portfolio.
 * Calibrado para a voz do Matheus: confiante e direto, orientado a impacto
 * de negócio e humano (caloroso, sem soar genérico).
 */
export function globalStyle(locale: Locale): string {
  return [
    `VOICE & STYLE (follow strictly):`,
    `- Write in ${LANG_LABEL[locale]}. Natural, fluent, native sounding.`,
    `- Confident and direct: affirmative sentences and strong active verbs (built, shipped, led, delivered, scaled). No hedging like "I try to", "maybe", or "a bit".`,
    `- Lead with impact and outcomes (what changed, the scale, the value) before listing technologies.`,
    `- Human and warm: sound like a real person, not a brochure. Keep the same point of view as the source copy (do not switch between first and third person).`,
    `- Be specific. Avoid clichés and filler ("passionate about", "results driven", "cutting edge", "team player").`,
    `- NEVER use an em dash (—) or en dash (–). Use commas, periods, or parentheses instead.`,
    `- Stay truthful to the facts provided. Do not invent numbers, clients, employers, or features.`,
  ].join("\n");
}

interface PersonaVoice {
  label: string;
  /** Foco de conteúdo e ênfase de tom para esta persona. */
  focus: string;
}

export const PERSONA_VOICE: Record<PersonaId, PersonaVoice> = {
  default: {
    label: "Visitor",
    focus:
      "Give a confident, well rounded picture: range as an engineer, the impact of the work, and the person behind it. Keep it warm and human.",
  },
  recruiter: {
    label: "Recruiter",
    focus:
      "Emphasize impact, ownership, and collaboration. Highlight what was delivered and the outcomes, plus how he works with people. Concrete over abstract, warm and approachable.",
  },
  techlead: {
    label: "Tech Lead",
    focus:
      "Emphasize architecture, engineering decisions, and reliable delivery, framed by the impact they produced rather than a raw tech list. Confident and precise, still human.",
  },
  cto: {
    label: "CTO / Founder",
    focus:
      "Emphasize business value, scale, and ownership. Connect engineering to what the business cares about: speed to ship, reliability, growth. Direct and decisive.",
  },
  designer: {
    label: "Designer",
    focus:
      "Emphasize craft, UX sensibility, attention to detail, and collaboration with design. Show taste and care for the experience. Warm and human.",
  },
};

const NUMERIC_RANGE = /(\d)\s*[–—]\s*(\d)/g;
const ANY_DASH = /\s*[—–]\s*/g;

/**
 * Remove travessões (— e –) de qualquer texto gerado pela IA, como defesa em
 * profundidade caso o modelo ignore a instrução do prompt. Mantém intervalos
 * numéricos com hífen e evita pontuação duplicada.
 */
export function sanitizeAIText(text: string): string {
  return text
    .replace(NUMERIC_RANGE, "$1-$2")
    .replace(ANY_DASH, ", ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[\s,]+/, "")
    .trim();
}
