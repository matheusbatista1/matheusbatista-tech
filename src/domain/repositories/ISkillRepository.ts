import type { Skill, SkillCategory } from "../entities/Skill";

export interface ISkillRepository {
  list(): Promise<Skill[]>;
  listByCategory(category: SkillCategory): Promise<Skill[]>;
  groupedByCategory(): Promise<Record<SkillCategory, Skill[]>>;
}
