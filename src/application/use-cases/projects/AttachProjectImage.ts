import type { ProjectImage } from "@/domain/entities/ProjectImage";
import type { IProjectImageRepository } from "@/domain/repositories/IProjectImageRepository";
import type { LogActivity } from "../activity/LogActivity";

export interface AttachProjectImageInput {
  projectId: string;
  url: string;
  alt?: string | null;
  order?: number;
}

export class AttachProjectImage {
  constructor(
    private readonly projectImageRepo: IProjectImageRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: AttachProjectImageInput, actorEmail?: string | null): Promise<ProjectImage> {
    const image = await this.projectImageRepo.create({
      projectId: input.projectId,
      url: input.url,
      alt: input.alt ?? null,
      order: input.order ?? 0,
      isCover: false,
    });

    await this.logActivity.execute({
      action: "upload",
      entity: "project",
      entityId: input.projectId,
      actorEmail: actorEmail ?? null,
      diff: { imageId: image.id, url: image.url },
    });

    return image;
  }
}
