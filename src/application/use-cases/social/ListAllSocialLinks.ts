import type { SocialLink } from "@/domain/entities/SocialLink";
import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";

export class ListAllSocialLinks {
  constructor(private readonly socialRepo: ISocialLinkRepository) {}

  async execute(): Promise<SocialLink[]> {
    return this.socialRepo.list({ visibleOnly: false });
  }
}
