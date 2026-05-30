import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";

export class DeleteSocialLink {
  constructor(private readonly socialRepo: ISocialLinkRepository) {}

  async execute(id: string): Promise<void> {
    await this.socialRepo.delete(id);
  }
}
