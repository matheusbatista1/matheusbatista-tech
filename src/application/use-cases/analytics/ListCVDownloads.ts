import type {
  CVDownloadListResult,
  ICVDownloadRepository,
} from "@/domain/repositories/ICVDownloadRepository";

export interface ListCVDownloadsInput {
  limit?: number;
  offset?: number;
  locale?: string;
  since?: Date;
}

export class ListCVDownloads {
  constructor(private readonly repo: ICVDownloadRepository) {}

  async execute(input: ListCVDownloadsInput = {}): Promise<CVDownloadListResult> {
    return this.repo.listPaged({
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
      locale: input.locale,
      since: input.since,
    });
  }
}
