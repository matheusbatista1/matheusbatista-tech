import type { Locale } from "@/domain/value-objects/Locale";

const LANG_LABEL: Record<Locale, string> = {
  en: "English",
  pt: "Brazilian Portuguese",
  es: "Spanish",
};

/**
 * Prompt para resumir um texto arbitrario em ate `maxWords` palavras,
 * preservando o idioma do locale.
 */
export function buildSummarizePrompt(text: string, maxWords: number, locale: Locale): string {
  const langName = LANG_LABEL[locale];
  return [
    `Summarize the following text in AT MOST ${maxWords} words.`,
    `Keep the summary faithful to the original meaning.`,
    `Do not introduce new facts. Do not include any preface or quotes.`,
    `WRITE THE SUMMARY IN ${langName}.`,
    ``,
    `TEXT:`,
    text,
    ``,
    `Return COMPACT JSON only: {"summary":"<your summary, up to ${maxWords} words>"}`,
  ].join("\n");
}
