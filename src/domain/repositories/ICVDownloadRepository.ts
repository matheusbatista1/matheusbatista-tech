import type { CVDownload, NewCVDownload } from "@/domain/entities/CVDownload";

export interface ICVDownloadRepository {
  create(input: NewCVDownload): Promise<CVDownload>;
  count(): Promise<number>;
  countSince(date: Date): Promise<number>;
  /**
   * Conta agregada por dia (UTC) no intervalo [from, to).
   * Retorna Map<"YYYY-MM-DD", count>. Dias sem eventos não aparecem no mapa.
   */
  countByDayRange(from: Date, to: Date): Promise<Map<string, number>>;
}
