import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";
import { prisma } from "../db/prisma";
import { toSkill } from "../db/mappers/skillMapper";

const CATEGORIES: readonly SkillCategory[] = ["frontend", "backend", "database", "devops", "tools"];

export class PrismaSkillRepository implements ISkillRepository {
  async list(): Promise<Skill[]> {
    const rows = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
    return rows.map(toSkill);
  }

  async listByCategory(category: SkillCategory): Promise<Skill[]> {
    const rows = await prisma.skill.findMany({ where: { category }, orderBy: { order: "asc" } });
    return rows.map(toSkill);
  }

  async groupedByCategory(): Promise<Record<SkillCategory, Skill[]>> {
    const all = await this.list();
    const grouped = Object.fromEntries(CATEGORIES.map((c) => [c, [] as Skill[]])) as Record<
      SkillCategory,
      Skill[]
    >;
    for (const skill of all) {
      grouped[skill.category].push(skill);
    }
    return grouped;
  }
}
