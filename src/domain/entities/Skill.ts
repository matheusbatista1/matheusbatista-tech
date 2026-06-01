export type SkillCategory = "frontend" | "backend" | "database" | "devops" | "tools";

export interface Skill {
  id: string;
  name: string;
  key: string;
  category: SkillCategory;
  color: string | null;
  fg: string | null;
  iconUrl: string | null;
  iconScale: number | null;
  iconX: number | null;
  iconY: number | null;
  order: number;
}
