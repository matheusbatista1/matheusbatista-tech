import type { Skill } from "@/domain/entities/Skill";
import type { ISkillRepository, SkillInput } from "@/domain/repositories/ISkillRepository";

export class UpdateSkill {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute(id: string, input: SkillInput): Promise<Skill> {
    return this.skillRepo.update(id, input);
  }
}
