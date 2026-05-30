import type { Skill } from "@/domain/entities/Skill";
import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";

export class ListSkills {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute(): Promise<Skill[]> {
    return this.skillRepo.list();
  }
}
