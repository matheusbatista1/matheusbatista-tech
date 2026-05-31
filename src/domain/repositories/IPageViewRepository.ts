import type { PageView, NewPageView } from "@/domain/entities/PageView";

export interface IPageViewRepository {
  create(input: NewPageView): Promise<PageView>;
  count(): Promise<number>;
  countSince(date: Date): Promise<number>;
  /**
   * Conta agregada por dia (UTC) no intervalo [from, to).
   * Retorna Map<"YYYY-MM-DD", count>. Dias sem eventos não aparecem no mapa.
   */
  countByDayRange(from: Date, to: Date): Promise<Map<string, number>>;
}
