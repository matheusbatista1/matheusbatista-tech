import type { SocialLink } from "@/domain/entities/SocialLink";
import type {
  ISocialLinkRepository,
  SocialLinkInput,
} from "@/domain/repositories/ISocialLinkRepository";

export class CreateSocialLink {
  constructor(private readonly socialRepo: ISocialLinkRepository) {}

  async execute(input: SocialLinkInput): Promise<SocialLink> {
    return this.socialRepo.create(input);
  }
}
