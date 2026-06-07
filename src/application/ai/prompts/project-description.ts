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
    `Write a project description for ${name}, an engineering project by ${context?.name ?? "the portfolio author"}.`,
    `Goal: 2 to 3 sentences per language, in en, pt and es.`,
    `Confident and direct, led by impact and what the project actually does. Low jargon, human, specific. Match the portfolio tone.`,
    `Do NOT invent features or numbers. Only describe what the inputs imply.`,
    `NEVER use an em dash (—) or en dash (–). Use commas, periods, or parentheses instead.`,
    `If a strong one line tagline fits (<=10 words, English), include it. Otherwise omit it.`,
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
