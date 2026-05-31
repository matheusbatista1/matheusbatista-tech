import type { SiteSettings, SiteSettingsPatch } from "@/domain/entities/SiteSettings";

export interface ISiteSettingsRepository {
  get(): Promise<SiteSettings | null>;
  upsert(patch: SiteSettingsPatch): Promise<SiteSettings>;
}
