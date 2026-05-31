import type { PageView, NewPageView } from "@/domain/entities/PageView";

export interface ListPagedOptions {
  limit?: number;
  offset?: number;
  isBot?: boolean;
  countryCode?: string;
  since?: Date;
  until?: Date;
  search?: string;
}

export interface ListPagedResult {
  entries: PageView[];
  total: number;
}

export interface AggregateOptions {
  since?: Date;
  limit?: number;
}

export interface CountryAggregate {
  countryCode: string | null;
  count: number;
}

export interface PathAggregate {
  path: string;
  count: number;
}

export interface IPageViewRepository {
  create(input: NewPageView): Promise<PageView>;
  count(): Promise<number>;
  countSince(date: Date): Promise<number>;
  /**
   * Conta agregada por dia (UTC) no intervalo [from, to).
   * Retorna Map<"YYYY-MM-DD", count>. Dias sem eventos não aparecem no mapa.
   */
  countByDayRange(from: Date, to: Date): Promise<Map<string, number>>;
  listPaged(opts: ListPagedOptions): Promise<ListPagedResult>;
  countUniqueIpHashes(since?: Date): Promise<number>;
  countBots(since?: Date): Promise<number>;
  aggregateTopCountries(opts?: AggregateOptions): Promise<CountryAggregate[]>;
  aggregateTopPaths(opts?: AggregateOptions): Promise<PathAggregate[]>;
}
