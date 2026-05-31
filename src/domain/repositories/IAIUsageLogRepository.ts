import type { AIUsageEvent, AIUsageStatus, NewAIUsageEvent } from "@/domain/entities/AIUsageEvent";

export interface ListRecentAIUsageOptions {
  kind?: string;
  status?: AIUsageStatus;
  since?: Date;
  limit?: number;
  offset?: number;
}

export interface IAIUsageLogRepository {
  create(input: NewAIUsageEvent): Promise<AIUsageEvent>;
  count(): Promise<number>;
  countSince(date: Date): Promise<number>;
  /**
   * Conta agregada por dia (UTC) no intervalo [from, to).
   * Retorna Map<"YYYY-MM-DD", count>. Dias sem eventos não aparecem no mapa.
   */
  countByDayRange(from: Date, to: Date): Promise<Map<string, number>>;
  listRecent(opts?: ListRecentAIUsageOptions): Promise<AIUsageEvent[]>;
  countFiltered(opts?: Omit<ListRecentAIUsageOptions, "limit" | "offset">): Promise<number>;
}
