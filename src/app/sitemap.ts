import type { MetadataRoute } from "next";
import { env } from "@/infrastructure/config/env";
import { locales } from "@/presentation/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/domain/value-objects/Locale";

const SECTIONS = ["", "#about", "#projects", "#skills", "#contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
    for (const section of SECTIONS) {
      entries.push({
        url: `${base}${prefix}${section}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: section === "" ? 1.0 : 0.7,
      });
    }
  }

  return entries;
}
