import type { IProjectImageRepository } from "@/domain/repositories/IProjectImageRepository";
import type { LogActivity } from "../activity/LogActivity";

export interface ReorderProjectImagesInput {
  projectId: string;
  orderedIds: string[];
}

export class ReorderProjectImages {
  constructor(
    private readonly projectImageRepo: IProjectImageRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: ReorderProjectImagesInput, actorEmail?: string | null): Promise<void> {
    await this.projectImageRepo.reorder(input.projectId, input.orderedIds);

    await this.logActivity.execute({
      action: "update",
      entity: "project",
      entityId: input.projectId,
      actorEmail: actorEmail ?? null,
      diff: { reorderImages: input.orderedIds },
    });
  }
}
