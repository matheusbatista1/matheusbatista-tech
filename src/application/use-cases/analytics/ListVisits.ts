import type {
  IPageViewRepository,
  ListPagedResult,
} from "@/domain/repositories/IPageViewRepository";

export interface ListVisitsInput {
  limit?: number;
  offset?: number;
  isBot?: boolean;
  countryCode?: string;
  since?: Date;
  until?: Date;
  search?: string;
}

export class ListVisits {
  constructor(private readonly repo: IPageViewRepository) {}

  async execute(input: ListVisitsInput = {}): Promise<ListPagedResult> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;
    return this.repo.listPaged({
      limit,
      offset,
      isBot: input.isBot,
      countryCode: input.countryCode,
      since: input.since,
      until: input.until,
      search: input.search,
    });
  }
}
