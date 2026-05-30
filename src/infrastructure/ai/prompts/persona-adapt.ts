import type { PersonaId } from "@/domain/entities/ai/Persona";
import type { Locale } from "@/domain/value-objects/Locale";
import type { PromptContext } from "@/domain/entities/ai/PromptContext";

const PERSONA_DESCRIPTIONS: Record<PersonaId, { label: string; hint: string }> = {
  default: { label: "Visitor", hint: "Balanced overview" },
  recruiter: { label: "Recruiter", hint: "Soft skills, impact, availability" },
  techlead: { label: "Tech Lead", hint: "Hard skills, architecture, delivery" },
  cto: { label: "CTO / Founder", hint: "Business impact, scale, ownership" },
  designer: { label: "Designer", hint: "Craft, UX sensibility, collaboration" },
};

/**
 * Prompt para reescrever copy do portfólio segundo a persona.
 * Portado de ai.jsx (applyPersona()).
 */
export function buildPersonaAdaptPrompt(
  context: PromptContext,
  persona: PersonaId,
  locale: Locale,
): string {
  const { label, hint } = PERSONA_DESCRIPTIONS[persona];
  const langLabel = { en: "English", pt: "Brazilian Portuguese", es: "Spanish" }[locale];

  return [
    `Rewrite this engineer's portfolio copy for a specific reader. Reader: "${label}" — "${hint}".`,
    `Keep it truthful to the facts; only shift emphasis & tone. Keep lengths similar. WRITE IN ${langLabel}.`,
    ``,
    `FACTS (JSON):`,
    JSON.stringify(context),
    ``,
    `Return COMPACT minified JSON only:`,
    `{"tagline":"one punchy line","about":"1 short paragraph (2-3 sentences)","projects":[{"id":"<id>","description":"reframed 1-2 sentence description"}]}`,
  ].join("\n");
}
