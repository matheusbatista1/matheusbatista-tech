import type { Project } from "@/domain/entities/Project";
import type { IProjectRepository, ProjectInput } from "@/domain/repositories/IProjectRepository";
import { prisma } from "../db/prisma";
import { toProject } from "../db/mappers/projectMapper";

function toPrismaData(input: ProjectInput) {
  return {
    slug: input.slug,
    name: input.name,
    url: input.url,
    liveUrl: input.liveUrl,
    description: input.description as unknown as object,
    pill: input.pill,
    tags: input.tags,
    images: input.images as unknown as object,
    order: input.order,
    deployed: input.deployed,
    visible: input.visible,
  };
}

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

  async create(input: ProjectInput): Promise<Project> {
    const row = await prisma.project.create({ data: toPrismaData(input) });
    return toProject(row);
  }

  async update(id: string, input: ProjectInput): Promise<Project> {
    const row = await prisma.project.update({ where: { id }, data: toPrismaData(input) });
    return toProject(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
}
