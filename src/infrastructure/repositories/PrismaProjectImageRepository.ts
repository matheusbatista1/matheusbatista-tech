import type { ProjectImage, NewProjectImage } from "@/domain/entities/ProjectImage";
import type { IProjectImageRepository } from "@/domain/repositories/IProjectImageRepository";
import { prisma } from "../db/prisma";

export class PrismaProjectImageRepository implements IProjectImageRepository {
  async listByProject(projectId: string): Promise<ProjectImage[]> {
    return prisma.projectImage.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });
  }

  async create(image: NewProjectImage): Promise<ProjectImage> {
    return prisma.projectImage.create({
      data: {
        projectId: image.projectId,
        url: image.url,
        alt: image.alt,
        order: image.order,
        isCover: image.isCover,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.projectImage.delete({ where: { id } });
  }

  async setCover(projectId: string, imageId: string): Promise<void> {
    await prisma.$transaction([
      prisma.projectImage.updateMany({
        where: { projectId, isCover: true },
        data: { isCover: false },
      }),
      prisma.projectImage.update({
        where: { id: imageId },
        data: { isCover: true },
      }),
    ]);
  }

  async reorder(projectId: string, orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.projectImage.updateMany({
          where: { id, projectId },
          data: { order: index },
        }),
      ),
    );
  }
}
