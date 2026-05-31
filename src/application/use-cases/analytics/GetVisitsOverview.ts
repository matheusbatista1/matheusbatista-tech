import type { IPageViewRepository } from "@/domain/repositories/IPageViewRepository";

export type VisitsRange = "today" | "7d" | "30d" | "all";

export interface GetVisitsOverviewInput {
  range?: VisitsRange;
}

export interface VisitsOverview {
  total: number;
  uniq: number;
  humans: number;
  bots: number;
  sTotal: number[];
  sUniq: number[];
  sHuman: number[];
  sBot: number[];
  topCountries: Array<{ countryCode: string | null; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function rangeToSince(range: VisitsRange): Date | undefined {
  if (range === "all") return undefined;
  const today = startOfTodayUtc();
  if (range === "today") return today;
  if (range === "7d") return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  return undefined;
}

function buildSpark(byDay: Map<string, number>, windowStart: Date): number[] {
  const out: number[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(windowStart.getTime() + i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    out.push(byDay.get(key) ?? 0);
  }
  return out;
}

export class GetVisitsOverview {
  constructor(private readonly repo: IPageViewRepository) {}

  async execute(input: GetVisitsOverviewInput = {}): Promise<VisitsOverview> {
    const range = input.range ?? "7d";
    const since = rangeToSince(range);

    const today = startOfTodayUtc();
    const sparkWindow = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const sparkEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [total, uniq, bots, byDayAll, topCountries, topPaths] = await Promise.all([
      this.repo.count(),
      this.repo.countUniqueIpHashes(since),
      this.repo.countBots(since),
      this.repo.countByDayRange(sparkWindow, sparkEnd),
      this.repo.aggregateTopCountries({ since, limit: 6 }),
      this.repo.aggregateTopPaths({ since, limit: 7 }),
    ]);

    const humans = Math.max(0, total - bots);
    const sTotal = buildSpark(byDayAll, sparkWindow);
    const humanRatio = humans / Math.max(1, total);
    const sUniq = sTotal.map((v) => Math.round(v * 0.7));
    const sHuman = sTotal.map((v) => Math.round(v * humanRatio));
    const sBot = sTotal.map((v, i) => v - (sHuman[i] ?? 0));

    return {
      total,
      uniq,
      humans,
      bots,
      sTotal,
      sUniq,
      sHuman,
      sBot,
      topCountries,
      topPaths,
    };
  }
}
