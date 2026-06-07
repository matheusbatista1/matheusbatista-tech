import type { Locale } from "@/domain/value-objects/Locale";
import type { ImproveCopyTone } from "@/application/ai/schemas/improve-copy";

const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

const TONE_HINT: Record<ImproveCopyTone, string> = {
  professional: "polished, confident, business-appropriate; avoid slang",
  casual: "warm, conversational, approachable; light contractions are fine",
  concise: "tight and direct; remove filler, prefer short sentences",
};

const DEFAULT_TONE_HINT = "natural and clear; preserve the author's voice";

/**
 * Prompt to improve a chunk of copy while keeping the same language,
 * tone, intent, and approximate length.
 */
export function buildImproveCopyPrompt(params: {
  text: string;
  locale: Locale;
  tone?: ImproveCopyTone;
}): string {
  const { text, locale, tone } = params;
  const langName = LANG_LABEL[locale];
  const toneHint = tone ? TONE_HINT[tone] : DEFAULT_TONE_HINT;
  const toneLabel = tone ?? "neutral";

  return [
    `You are a senior copy editor improving a portfolio's UI copy.`,
    `Goal: rewrite the TEXT so it reads sharper and more confident while preserving meaning, facts, and intent.`,
    `Constraints:`,
    `- WRITE the "improved" field IN ${langName} (same language as the input).`,
    `- Target tone "${toneLabel}": ${toneHint}.`,
    `- Keep approximately the same length (±20% characters).`,
    `- Do NOT invent facts, names, numbers, links, or product details.`,
    `- Preserve markdown, code, URLs, and proper nouns exactly as given.`,
    `- Sharpen rhythm, word choice, and impact while keeping the author's authentic voice.`,
    `- NEVER use an em dash (—) or en dash (–). Use commas, periods, or parentheses instead.`,
    ``,
    `TEXT:`,
    JSON.stringify(text),
    ``,
    `Return COMPACT JSON only with this shape:`,
    `{"improved":"<rewritten copy>","notes":"<=20 words explaining the main changes (optional)"}`,
  ].join("\n");
}
