import type { AboutContent } from "@/domain/entities/AboutContent";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";

export class UpdateAboutContent {
  constructor(private readonly contentRepo: IContentRepository) {}

  async execute(about: AboutContent): Promise<void> {
    await this.contentRepo.updateAbout(about);
  }
}
