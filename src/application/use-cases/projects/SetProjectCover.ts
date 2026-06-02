import type { IProjectImageRepository } from "@/domain/repositories/IProjectImageRepository";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { LogActivity } from "../activity/LogActivity";

export interface SetProjectCoverInput {
  projectId: string;
  imageId: string;
}

export class SetProjectCover {
  constructor(
    private readonly projectImageRepo: IProjectImageRepository,
    private readonly projectRepo: IProjectRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: SetProjectCoverInput, actorEmail?: string | null): Promise<void> {
    await this.projectImageRepo.setCover(input.projectId, input.imageId);

    const project = await this.projectRepo.findById(input.projectId);
    if (!project) return;

    const gallery = project.gallery ?? (await this.projectImageRepo.listByProject(input.projectId));
    const image = gallery.find((img) => img.id === input.imageId);
    const coverUrl = image?.url ?? null;

    await this.projectRepo.update(input.projectId, {
      slug: project.slug,
      name: project.name,
      url: project.url,
      liveUrl: project.liveUrl,
      description: project.description,
      pill: project.pill,
      tags: project.tags,
      images: project.images,
      employerName: project.employerName,
      employerUrl: project.employerUrl,
      clientName: project.clientName,
      clientUrl: project.clientUrl,
      order: project.order,
      deployed: project.deployed,
      visible: project.visible,
    });

    await this.logActivity.execute({
      action: "update",
      entity: "project",
      entityId: input.projectId,
      actorEmail: actorEmail ?? null,
      diff: { coverImageId: input.imageId, coverImageUrl: coverUrl },
    });
  }
}
