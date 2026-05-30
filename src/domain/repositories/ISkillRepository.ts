import type { Skill, SkillCategory } from "../entities/Skill";

export interface SkillInput {
  name: string;
  key: string;
  category: SkillCategory;
  color: string | null;
  order: number;
}

export interface ISkillRepository {
  list(): Promise<Skill[]>;
  listByCategory(category: SkillCategory): Promise<Skill[]>;
  groupedByCategory(): Promise<Record<SkillCategory, Skill[]>>;
  findById(id: string): Promise<Skill | null>;
  create(input: SkillInput): Promise<Skill>;
  update(id: string, input: SkillInput): Promise<Skill>;
  delete(id: string): Promise<void>;
}
