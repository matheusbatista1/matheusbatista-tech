import type { SiteSettings } from "@/domain/entities/SiteSettings";
import type { ISiteSettingsRepository } from "@/domain/repositories/ISiteSettingsRepository";

export class GetSiteSettings {
  constructor(private readonly siteSettingsRepo: ISiteSettingsRepository) {}

  async execute(): Promise<SiteSettings> {
    const existing = await this.siteSettingsRepo.get();
    if (existing) return existing;

    return {
      id: "singleton",
      seoTitle: { en: "", pt: "", es: "" },
      seoDescription: { en: "", pt: "", es: "" },
      ogImageUrl: null,
      analyticsEnabled: true,
      aiFeaturesEnabled: true,
      maintenanceMode: false,
      contactEmail: null,
      updatedAt: new Date(),
    };
  }
}
