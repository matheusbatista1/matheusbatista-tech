import type { IBlobStorage } from "@/domain/services/IBlobStorage";
import type { LogActivity } from "../activity/LogActivity";

export class DeleteAsset {
  constructor(
    private readonly blob: IBlobStorage,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(url: string, actorEmail?: string | null): Promise<void> {
    await this.blob.del(url);
    await this.logActivity.execute({
      action: "delete",
      entity: "asset",
      actorEmail: actorEmail ?? null,
      diff: { url },
    });
  }
}
