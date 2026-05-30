import type { Locale } from "@/domain/value-objects/Locale";
import { DEFAULT_LOCALE, LOCALES } from "@/domain/value-objects/Locale";

export const locales = LOCALES;
export const defaultLocale: Locale = DEFAULT_LOCALE;

export const localePrefix = "as-needed" as const;
