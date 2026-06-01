import type { Skill as PrismaSkill } from "@prisma/client";
import type { Skill, SkillCategory } from "@/domain/entities/Skill";

const VALID_CATEGORIES: readonly SkillCategory[] = [
  "frontend",
  "backend",
  "database",
  "devops",
  "tools",
];

export function toSkill(row: PrismaSkill): Skill {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    category: VALID_CATEGORIES.includes(row.category as SkillCategory)
      ? (row.category as SkillCategory)
      : "tools",
    color: row.color,
    fg: row.fg,
    iconUrl: row.iconUrl,
    iconScale: row.iconScale,
    iconX: row.iconX,
    iconY: row.iconY,
    order: row.order,
  };
}
