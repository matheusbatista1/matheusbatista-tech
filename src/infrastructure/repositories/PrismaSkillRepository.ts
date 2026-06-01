import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import type { ISkillRepository, SkillInput } from "@/domain/repositories/ISkillRepository";
import { prisma } from "../db/prisma";
import { toSkill } from "../db/mappers/skillMapper";

const CATEGORIES: readonly SkillCategory[] = ["frontend", "backend", "database", "devops", "tools"];

function toPrismaData(input: SkillInput) {
  return {
    name: input.name,
    key: input.key,
    category: input.category,
    color: input.color,
    iconUrl: input.iconUrl,
    iconScale: input.iconScale,
    iconX: input.iconX,
    iconY: input.iconY,
    order: input.order,
  };
}

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

  async findById(id: string): Promise<Skill | null> {
    const row = await prisma.skill.findUnique({ where: { id } });
    return row ? toSkill(row) : null;
  }

  async create(input: SkillInput): Promise<Skill> {
    const row = await prisma.skill.create({ data: toPrismaData(input) });
    return toSkill(row);
  }

  async update(id: string, input: SkillInput): Promise<Skill> {
    const row = await prisma.skill.update({ where: { id }, data: toPrismaData(input) });
    return toSkill(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.skill.delete({ where: { id } });
  }
}
