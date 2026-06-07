import type { CVAsset } from "@/domain/entities/CVAsset";
import type { Locale } from "@/domain/value-objects/Locale";

/** CV correspondente ao idioma atual do site, se houver. */
export function getCvForLocale(cvs: CVAsset[], locale: Locale): CVAsset | undefined {
  return cvs.find((cv) => cv.locale === locale);
}
