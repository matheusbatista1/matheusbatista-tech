import type { CVAsset } from "@/domain/entities/CVAsset";
import type { ICVAssetRepository } from "@/domain/repositories/ICVAssetRepository";
import type { IBlobStorage } from "@/domain/services/IBlobStorage";
import type { Locale } from "@/domain/value-objects/Locale";
import type { LogActivity } from "../activity/LogActivity";

export interface UploadCVInput {
  locale: Locale;
  file: Blob | ArrayBuffer | Buffer | ReadableStream;
  filename: string;
  sizeBytes: number;
  actorEmail?: string | null;
  ip?: string | null;
}

export class UploadCV {
  constructor(
    private readonly cvAssetRepo: ICVAssetRepository,
    private readonly blobStorage: IBlobStorage,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: UploadCVInput): Promise<CVAsset> {
    const existing = await this.cvAssetRepo.getByLocale(input.locale);
    if (existing) {
      try {
        await this.blobStorage.del(existing.url);
      } catch (err) {
        console.error("[UploadCV] falha ao remover blob anterior", err);
      }
    }

    const { url } = await this.blobStorage.put(`cv/${input.locale}/${input.filename}`, input.file, {
      contentType: "application/pdf",
    });

    const asset = await this.cvAssetRepo.upsert({
      locale: input.locale,
      url,
      filename: input.filename,
      sizeBytes: input.sizeBytes,
    });

    await this.logActivity.execute({
      action: "upload",
      entity: "cv",
      entityId: input.locale,
      actorEmail: input.actorEmail ?? null,
      ip: input.ip ?? null,
      diff: { url, filename: input.filename, sizeBytes: input.sizeBytes },
    });

    return asset;
  }
}
