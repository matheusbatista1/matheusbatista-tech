import type { SocialLink } from "@/domain/entities/SocialLink";
import type {
  ISocialLinkRepository,
  SocialLinkInput,
} from "@/domain/repositories/ISocialLinkRepository";

export class UpdateSocialLink {
  constructor(private readonly socialRepo: ISocialLinkRepository) {}

  async execute(id: string, input: SocialLinkInput): Promise<SocialLink> {
    return this.socialRepo.update(id, input);
  }
}
