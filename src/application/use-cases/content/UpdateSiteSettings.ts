import type { IContentRepository, SiteSettings } from "@/domain/repositories/IContentRepository";

export class UpdateSiteSettings {
  constructor(private readonly contentRepo: IContentRepository) {}

  async execute(settings: SiteSettings): Promise<void> {
    await this.contentRepo.updateSettings(settings);
  }
}
