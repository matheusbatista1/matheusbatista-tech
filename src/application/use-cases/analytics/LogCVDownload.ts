import type { ICVDownloadRepository } from "@/domain/repositories/ICVDownloadRepository";
import type { Locale } from "@/domain/value-objects/Locale";

export interface LogCVDownloadInput {
  locale: Locale;
  cvAssetId?: string | null;
  ipHash: string;
  userAgent?: string | null;
  referrer?: string | null;
}

export class LogCVDownload {
  constructor(private readonly repo: ICVDownloadRepository) {}

  async execute(input: LogCVDownloadInput): Promise<void> {
    try {
      await this.repo.create({
        locale: input.locale,
        cvAssetId: input.cvAssetId ?? null,
        ipHash: input.ipHash,
        userAgent: input.userAgent ?? null,
        referrer: input.referrer ?? null,
      });
    } catch (err) {
      console.warn("[LogCVDownload] falha ao registrar download", err);
    }
  }
}
