import type { SkillCategory } from "@/domain/entities/Skill";

export interface SkillActionResult {
  ok?: boolean;
  id?: string;
  error?: string;
}

export interface SkillPayload {
  name: string;
  key: string;
  color: string | null;
  iconUrl: string | null;
  iconScale: number | null;
  iconX: number | null;
  iconY: number | null;
}

export interface SkillActions {
  create: (category: SkillCategory, payload: SkillPayload) => Promise<SkillActionResult>;
  update: (id: string, payload: SkillPayload) => Promise<SkillActionResult>;
  delete: (id: string, name: string, category: SkillCategory) => Promise<SkillActionResult>;
}
