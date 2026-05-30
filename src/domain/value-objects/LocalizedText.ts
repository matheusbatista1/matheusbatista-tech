import type { Locale } from "./Locale";
import { DEFAULT_LOCALE } from "./Locale";

export type LocalizedText = Record<Locale, string>;

export function pickLocalized(
  text: LocalizedText | string | null | undefined,
  locale: Locale,
): string {
  if (text == null) return "";
  if (typeof text === "string") return text;
  return text[locale] ?? text[DEFAULT_LOCALE] ?? "";
}
