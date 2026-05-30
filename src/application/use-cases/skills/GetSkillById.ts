import type { Skill } from "@/domain/entities/Skill";
import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";

export class GetSkillById {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute(id: string): Promise<Skill | null> {
    return this.skillRepo.findById(id);
  }
}
