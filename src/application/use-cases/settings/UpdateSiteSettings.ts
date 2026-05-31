import type { SiteSettings, SiteSettingsPatch } from "@/domain/entities/SiteSettings";
import type { ISiteSettingsRepository } from "@/domain/repositories/ISiteSettingsRepository";
import type { LogActivity } from "../activity/LogActivity";

export class UpdateSiteSettings {
  constructor(
    private readonly siteSettingsRepo: ISiteSettingsRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(patch: SiteSettingsPatch, actorEmail?: string | null): Promise<SiteSettings> {
    const updated = await this.siteSettingsRepo.upsert(patch);

    await this.logActivity.execute({
      action: "update",
      entity: "settings",
      actorEmail: actorEmail ?? null,
      diff: patch as Record<string, unknown>,
    });

    return updated;
  }
}
