import type { IBlobStorage, BlobPutResult } from "@/domain/services/IBlobStorage";
import type { LogActivity } from "../activity/LogActivity";

export interface UploadAssetInput {
  scope: "project" | "cv" | "og" | "misc";
  pathname: string;
  body: Blob | ArrayBuffer | Buffer | ReadableStream;
  contentType?: string;
  actorEmail?: string | null;
  ip?: string | null;
}

export class UploadAsset {
  constructor(
    private readonly blob: IBlobStorage,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(input: UploadAssetInput): Promise<BlobPutResult> {
    const result = await this.blob.put(`${input.scope}/${input.pathname}`, input.body, {
      contentType: input.contentType,
      addRandomSuffix: true,
    });
    await this.logActivity.execute({
      action: "upload",
      entity: "asset",
      actorEmail: input.actorEmail ?? null,
      diff: { url: result.url, scope: input.scope },
      ip: input.ip ?? null,
    });
    return result;
  }
}
