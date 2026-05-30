import type { PromptContext } from "@/domain/entities/ai/PromptContext";

/**
 * Prompt para ranking semântico de projetos.
 * Portado de ai-assistant.jsx (SemanticSearch).
 */
export function buildSemanticSearchPrompt(context: PromptContext, query: string): string {
  return [
    `Rank these projects by how well they match the query, semantically (not just keywords).`,
    `QUERY: ${JSON.stringify(query)}`,
    `PROJECTS (JSON): ${JSON.stringify(context.projects)}`,
    `Return COMPACT JSON only: {"ranked":[{"id":"<id>","reason":"<=8 words why it matches"}]}`,
    `Only include projects with a real match (can be fewer than all). Best first.`,
  ].join("\n");
}
