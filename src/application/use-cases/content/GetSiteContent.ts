import type { IContentRepository, SiteContent } from "@/domain/repositories/IContentRepository";

export class GetSiteContent {
  constructor(private readonly contentRepo: IContentRepository) {}

  async execute(): Promise<SiteContent> {
    const content = await this.contentRepo.get();
    if (!content) {
      throw new Error("SiteContent not initialized. Run `pnpm db:seed`.");
    }
    return content;
  }
}
