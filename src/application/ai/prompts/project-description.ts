import type { PromptContext } from "@/domain/entities/ai/PromptContext";

export interface ProjectDescriptionPromptInput {
  name: string;
  tags: string[];
  url?: string;
  hint?: string;
  /** Optional CMS context to keep tone aligned with the rest of the portfolio. */
  context?: PromptContext;
}

/**
 * Prompt para gerar descrições curtas (2 frases) de um projeto em EN/PT/ES.
 * Evita jargão excessivo, mantém o tom alinhado ao portfolio.
 */
export function buildProjectDescriptionPrompt(input: ProjectDescriptionPromptInput): string {
  const { name, tags, url, hint, context } = input;

  const facts = {
    name,
    tags,
    url: url ?? null,
    hint: hint ?? null,
  };

  const portfolioTone = context
    ? {
        engineer: context.name,
        role: context.role,
        tagline: context.tagline,
        about: context.about.slice(0, 300),
      }
    : null;

  return [
    `Write a short project description for ${name}, an engineering project owned by ${context?.name ?? "the portfolio author"}.`,
    `Goal: 2 sentences per language. Plain, confident, low jargon. Match the portfolio tone.`,
    `Do NOT invent features or numbers — only describe what the inputs imply.`,
    `If a tagline is appropriate (one punchy line, ≤10 words, English), include it. Otherwise omit.`,
    ``,
    `INPUTS (JSON):`,
    JSON.stringify(facts),
    ``,
    portfolioTone ? `PORTFOLIO TONE (JSON):\n${JSON.stringify(portfolioTone)}\n` : ``,
    `Return COMPACT JSON only:`,
    `{"description":{"en":"...","pt":"...","es":"..."},"tagline":"optional one-liner in English"}`,
    `Languages: en = English, pt = Brazilian Portuguese, es = Spanish.`,
  ]
    .filter(Boolean)
    .join("\n");
}
