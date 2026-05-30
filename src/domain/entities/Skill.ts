export type SkillCategory = "frontend" | "backend" | "database" | "devops" | "tools";

export interface Skill {
  id: string;
  name: string;
  key: string;
  category: SkillCategory;
  color: string | null;
  order: number;
}
