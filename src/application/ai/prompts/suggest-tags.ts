import type { PromptContext } from "@/domain/entities/ai/PromptContext";

export interface SuggestTagsPromptInput {
  name: string;
  description: string;
  /** Optional CMS context: helps reuse tags that already exist in the portfolio. */
  context?: PromptContext;
}

/**
 * Prompt para sugerir 3-6 tags técnicas (frameworks/stacks/domínios) curtas
 * com base em nome + descrição do projeto.
 */
export function buildSuggestTagsPrompt(input: SuggestTagsPromptInput): string {
  const { name, description, context } = input;

  const existingTags = context
    ? Array.from(new Set(context.projects.flatMap((p) => p.tags))).slice(0, 40)
    : [];

  return [
    `Suggest 3 to 6 technical tags for a portfolio project.`,
    `Each tag: 1-3 words, lowercase, no leading "#". Prefer frameworks, stacks, or product domains.`,
    `Reuse tags from EXISTING_TAGS when they fit. Do NOT invent acronyms; do NOT include vague words like "modern" or "scalable".`,
    ``,
    `PROJECT (JSON): ${JSON.stringify({ name, description })}`,
    existingTags.length ? `EXISTING_TAGS (JSON): ${JSON.stringify(existingTags)}` : ``,
    ``,
    `Return COMPACT JSON only:`,
    `{"tags":["tag1","tag2","tag3"]}`,
  ]
    .filter(Boolean)
    .join("\n");
}
