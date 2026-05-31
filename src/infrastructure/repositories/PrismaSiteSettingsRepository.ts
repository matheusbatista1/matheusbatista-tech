import type { SiteSettings, SiteSettingsPatch } from "@/domain/entities/SiteSettings";
import type { ISiteSettingsRepository } from "@/domain/repositories/ISiteSettingsRepository";
import type { LocalizedText } from "@/domain/value-objects/LocalizedText";
import { prisma } from "../db/prisma";

const SINGLETON_ID = "singleton";

const EMPTY_LOCALIZED: LocalizedText = { en: "", pt: "", es: "" };

function toSiteSettings(row: {
  id: string;
  seoTitle: unknown;
  seoDescription: unknown;
  ogImageUrl: string | null;
  analyticsEnabled: boolean;
  aiFeaturesEnabled: boolean;
  maintenanceMode: boolean;
  contactEmail: string | null;
  updatedAt: Date;
}): SiteSettings {
  return {
    id: row.id,
    seoTitle: row.seoTitle as LocalizedText,
    seoDescription: row.seoDescription as LocalizedText,
    ogImageUrl: row.ogImageUrl,
    analyticsEnabled: row.analyticsEnabled,
    aiFeaturesEnabled: row.aiFeaturesEnabled,
    maintenanceMode: row.maintenanceMode,
    contactEmail: row.contactEmail,
    updatedAt: row.updatedAt,
  };
}

export class PrismaSiteSettingsRepository implements ISiteSettingsRepository {
  async get(): Promise<SiteSettings | null> {
    const row = await prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } });
    return row ? toSiteSettings(row) : null;
  }

  async upsert(patch: SiteSettingsPatch): Promise<SiteSettings> {
    const row = await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        seoTitle: (patch.seoTitle ?? EMPTY_LOCALIZED) as unknown as object,
        seoDescription: (patch.seoDescription ?? EMPTY_LOCALIZED) as unknown as object,
        ogImageUrl: patch.ogImageUrl ?? null,
        analyticsEnabled: patch.analyticsEnabled ?? true,
        aiFeaturesEnabled: patch.aiFeaturesEnabled ?? true,
        maintenanceMode: patch.maintenanceMode ?? false,
        contactEmail: patch.contactEmail ?? null,
      },
      update: {
        ...(patch.seoTitle !== undefined && {
          seoTitle: patch.seoTitle as unknown as object,
        }),
        ...(patch.seoDescription !== undefined && {
          seoDescription: patch.seoDescription as unknown as object,
        }),
        ...(patch.ogImageUrl !== undefined && { ogImageUrl: patch.ogImageUrl }),
        ...(patch.analyticsEnabled !== undefined && {
          analyticsEnabled: patch.analyticsEnabled,
        }),
        ...(patch.aiFeaturesEnabled !== undefined && {
          aiFeaturesEnabled: patch.aiFeaturesEnabled,
        }),
        ...(patch.maintenanceMode !== undefined && {
          maintenanceMode: patch.maintenanceMode,
        }),
        ...(patch.contactEmail !== undefined && { contactEmail: patch.contactEmail }),
      },
    });
    return toSiteSettings(row);
  }
}
