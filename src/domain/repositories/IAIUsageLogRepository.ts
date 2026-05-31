import type { AIUsageEvent, NewAIUsageEvent } from "@/domain/entities/AIUsageEvent";

export interface IAIUsageLogRepository {
  create(input: NewAIUsageEvent): Promise<AIUsageEvent>;
  count(): Promise<number>;
  countSince(date: Date): Promise<number>;
  /**
   * Conta agregada por dia (UTC) no intervalo [from, to).
   * Retorna Map<"YYYY-MM-DD", count>. Dias sem eventos não aparecem no mapa.
   */
  countByDayRange(from: Date, to: Date): Promise<Map<string, number>>;
}
