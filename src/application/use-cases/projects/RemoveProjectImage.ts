import type { IProjectImageRepository } from "@/domain/repositories/IProjectImageRepository";
import type { IBlobStorage } from "@/domain/services/IBlobStorage";
import type { LogActivity } from "../activity/LogActivity";

export interface RemoveProjectImageInput {
  imageId: string;
  url: string;
}

export class RemoveProjectImage {
  constructor(
    private readonly projectImageRepo: IProjectImageRepository,
    private readonly blobStorage: IBlobStorage,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: RemoveProjectImageInput, actorEmail?: string | null): Promise<void> {
    try {
      await this.blobStorage.del(input.url);
    } catch (err) {
      console.error("[RemoveProjectImage] falha ao remover blob", err);
    }

    await this.projectImageRepo.delete(input.imageId);

    await this.logActivity.execute({
      action: "delete",
      entity: "asset",
      entityId: input.imageId,
      actorEmail: actorEmail ?? null,
      diff: { url: input.url },
    });
  }
}
