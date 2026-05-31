import type { LocalizedText } from "@/domain/value-objects/LocalizedText";

export interface SiteSettings {
  id: string;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  ogImageUrl: string | null;
  analyticsEnabled: boolean;
  aiFeaturesEnabled: boolean;
  maintenanceMode: boolean;
  contactEmail: string | null;
  updatedAt: Date;
}

export type SiteSettingsPatch = Partial<Omit<SiteSettings, "id" | "updatedAt">>;
