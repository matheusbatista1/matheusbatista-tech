import type { ICVAssetRepository } from "@/domain/repositories/ICVAssetRepository";
import type { IBlobStorage } from "@/domain/services/IBlobStorage";
import type { Locale } from "@/domain/value-objects/Locale";
import type { LogActivity } from "../activity/LogActivity";

export interface DeleteCVInput {
  locale: Locale;
}

export class DeleteCV {
  constructor(
    private readonly cvAssetRepo: ICVAssetRepository,
    private readonly blobStorage: IBlobStorage,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: DeleteCVInput, actorEmail?: string | null): Promise<void> {
    const existing = await this.cvAssetRepo.getByLocale(input.locale);
    if (!existing) return;

    try {
      await this.blobStorage.del(existing.url);
    } catch (err) {
      console.error("[DeleteCV] falha ao remover blob", err);
    }

    await this.cvAssetRepo.delete(input.locale);

    await this.logActivity.execute({
      action: "delete",
      entity: "cv",
      entityId: input.locale,
      actorEmail: actorEmail ?? null,
      diff: { url: existing.url, filename: existing.filename },
    });
  }
}
