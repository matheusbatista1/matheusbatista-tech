import type { Skill } from "@/domain/entities/Skill";
import type { ISkillRepository, SkillInput } from "@/domain/repositories/ISkillRepository";

export class CreateSkill {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async execute(input: SkillInput): Promise<Skill> {
    return this.skillRepo.create(input);
  }
}
