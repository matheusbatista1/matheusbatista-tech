import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";

export class GroupSkillsByCategory {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute(): Promise<Record<SkillCategory, Skill[]>> {
    return this.skillRepo.groupedByCategory();
  }
}
