import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./config";
import type { Locale } from "@/domain/value-objects/Locale";

function isSupportedLocale(value: string | undefined): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isSupportedLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
