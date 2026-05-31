import type { Locale } from "@/domain/value-objects/Locale";

const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

export interface BuildTranslatePromptInput {
  text: string;
  from?: Locale;
  targets: Locale[];
}

export function buildTranslatePrompt({ text, from, targets }: BuildTranslatePromptInput): string {
  const sourceLabel = from ? LANG_LABEL[from] : "auto-detected source language";
  const targetEntries = targets.map((t) => `"${t}": "<translation in ${LANG_LABEL[t]}>"`).join(",");

  return [
    `Translate the text below from ${sourceLabel} into the requested target languages.`,
    `Preserve the original tone, voice, register and intent. Keep proper nouns, brand names, product names, code identifiers, URLs and numbers exactly as they appear.`,
    `Do not add commentary, notes, quotes or extra punctuation. Output translations only.`,
    `Targets (locale codes): ${targets.join(", ")}.`,
    ``,
    `TEXT:`,
    text,
    ``,
    `Return COMPACT JSON only with this exact shape, including ONLY the requested target locales:`,
    `{"translated":{${targetEntries}}}`,
  ].join("\n");
}
