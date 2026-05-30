import type { SocialLink } from "@/domain/entities/SocialLink";
import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";

export class GetSocialLinkById {
  constructor(private readonly socialRepo: ISocialLinkRepository) {}

  async execute(id: string): Promise<SocialLink | null> {
    return this.socialRepo.findById(id);
  }
}
