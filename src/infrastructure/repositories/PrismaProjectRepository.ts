import type { Project } from "@/domain/entities/Project";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import { prisma } from "../db/prisma";
import { toProject } from "../db/mappers/projectMapper";

export class PrismaProjectRepository implements IProjectRepository {
  async list({ visibleOnly = false }: { visibleOnly?: boolean } = {}): Promise<Project[]> {
    const rows = await prisma.project.findMany({
      where: visibleOnly ? { visible: true } : undefined,
      orderBy: { order: "asc" },
    });
    return rows.map(toProject);
  }

  async findById(id: string): Promise<Project | null> {
    const row = await prisma.project.findUnique({ where: { id } });
    return row ? toProject(row) : null;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const row = await prisma.project.findUnique({ where: { slug } });
    return row ? toProject(row) : null;
  }

  async findManyByIds(ids: string[]): Promise<Project[]> {
    const rows = await prisma.project.findMany({ where: { id: { in: ids } } });
    return rows.map(toProject);
  }
}
