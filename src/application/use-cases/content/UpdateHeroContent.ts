import type { HeroContent } from "@/domain/entities/HeroContent";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";

export class UpdateHeroContent {
  constructor(private readonly contentRepo: IContentRepository) {}

  async execute(hero: HeroContent): Promise<void> {
    await this.contentRepo.updateHero(hero);
  }
}
