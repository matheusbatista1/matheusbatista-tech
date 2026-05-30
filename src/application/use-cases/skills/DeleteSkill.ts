import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";

export class DeleteSkill {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute(id: string): Promise<void> {
    await this.skillRepo.delete(id);
  }
}
