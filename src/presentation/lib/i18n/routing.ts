import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "@/domain/value-objects/Locale";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
});

export const { Link, usePathname, useRouter, redirect, getPathname } = createNavigation(routing);
