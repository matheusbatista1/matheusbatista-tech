import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";
import type { IPageViewRepository } from "@/domain/repositories/IPageViewRepository";
import type { ICVDownloadRepository } from "@/domain/repositories/ICVDownloadRepository";
import type { IAIUsageLogRepository } from "@/domain/repositories/IAIUsageLogRepository";

export type TrendKind = "up" | "down";

export interface DashboardStats {
  totalVisits: number;
  totalMessages: number;
  messagesToday: number;
  unreadMessages: number;
  visibleProjects: number;
  cvDownloads: number;
  aiCalls7d: number;

  visitsSpark: number[];
  messagesSpark: number[];
  projectsSpark: number[];
  cvSpark: number[];

  visitsTrend: string;
  visitsTrendKind: TrendKind;
  messagesTrend: string;
  messagesTrendKind: TrendKind;
  projectsTrend: string;
  projectsTrendKind: TrendKind;
  cvTrend: string;
  cvTrendKind: TrendKind;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayUTC(ts: number): number {
  const d = new Date(ts);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function buildSpark(byDay: Map<string, number>, todayStart: number): number[] {
  return Array.from({ length: 7 }, (_, idx) => {
    const dayStart = todayStart - (6 - idx) * DAY_MS;
    return byDay.get(dayKey(dayStart)) ?? 0;
  });
}

function computeTrend(last: number, prev: number): { label: string; kind: TrendKind } {
  if (prev === 0 && last > 0) return { label: "+100%", kind: "up" };
  if (prev === 0 && last === 0) return { label: "+0%", kind: "up" };
  const pct = ((last - prev) / prev) * 100;
  const rounded = Math.round(pct);
  const label = `${rounded >= 0 ? "+" : ""}${rounded}%`;
  const kind: TrendKind = rounded >= 0 ? "up" : "down";
  return { label, kind };
}

export class GetDashboardStats {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly projectRepo: IProjectRepository,
    private readonly activityRepo: IActivityEventRepository,
    private readonly pageViewRepo: IPageViewRepository,
    private readonly cvDownloadRepo: ICVDownloadRepository,
    private readonly aiUsageLogRepo: IAIUsageLogRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const now = Date.now();
    const oneDayAgo = now - DAY_MS;
    const sevenDaysAgo = now - 7 * DAY_MS;
    const fourteenDaysAgo = now - 14 * DAY_MS;

    const sevenDaysAgoDate = new Date(sevenDaysAgo);
    const fourteenDaysAgoDate = new Date(fourteenDaysAgo);
    const nowDate = new Date(now);

    const [
      allMessages,
      unread,
      projects,
      activity,
      totalVisits,
      visitsByDay,
      visitsLast7,
      visitsLast14,
      cvDownloads,
      cvByDay,
      cvLast7,
      cvLast14,
      aiCalls7d,
    ] = await Promise.all([
      this.messageRepo.list({}),
      this.messageRepo.list({ unreadOnly: true }),
      this.projectRepo.list(),
      this.activityRepo.listRecent({ limit: 200 }),
      this.pageViewRepo.count(),
      this.pageViewRepo.countByDayRange(sevenDaysAgoDate, nowDate),
      this.pageViewRepo.countSince(sevenDaysAgoDate),
      this.pageViewRepo.countSince(fourteenDaysAgoDate),
      this.cvDownloadRepo.count(),
      this.cvDownloadRepo.countByDayRange(sevenDaysAgoDate, nowDate),
      this.cvDownloadRepo.countSince(sevenDaysAgoDate),
      this.cvDownloadRepo.countSince(fourteenDaysAgoDate),
      this.aiUsageLogRepo.countSince(sevenDaysAgoDate),
    ]);

    // activity é mantido para uso futuro (atividade recente)
    void activity;

    const messagesToday = allMessages.filter((m) => m.createdAt.getTime() >= oneDayAgo).length;
    const visibleProjects = projects.filter((p) => p.visible).length;
    const totalProjects = projects.length;

    const todayStart = startOfDayUTC(now);

    const messagesSpark: number[] = Array.from({ length: 7 }, (_, idx) => {
      const dayStart = todayStart - (6 - idx) * DAY_MS;
      const dayEnd = dayStart + DAY_MS;
      return allMessages.filter((m) => {
        const t = m.createdAt.getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
    });

    const messagesLast7 = allMessages.filter((m) => m.createdAt.getTime() >= sevenDaysAgo).length;
    const messagesPrev7 = allMessages.filter((m) => {
      const t = m.createdAt.getTime();
      return t >= fourteenDaysAgo && t < sevenDaysAgo;
    }).length;
    const messagesTrendInfo = computeTrend(messagesLast7, messagesPrev7);

    const projectsSpark: number[] = Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const cutoff = now - monthsAgo * 30 * DAY_MS;
      return projects.filter((p) => p.createdAt && p.createdAt.getTime() <= cutoff).length;
    });
    const projectsTrend = `${visibleProjects}/${totalProjects} live`;
    const projectsTrendKind: TrendKind = "up";

    const visitsSpark = buildSpark(visitsByDay, todayStart);
    const visitsPrev7 = visitsLast14 - visitsLast7;
    const visitsTrendInfo = computeTrend(visitsLast7, visitsPrev7);

    const cvSpark = buildSpark(cvByDay, todayStart);
    const cvPrev7 = cvLast14 - cvLast7;
    const cvTrendInfo = computeTrend(cvLast7, cvPrev7);

    return {
      totalVisits,
      totalMessages: allMessages.length,
      messagesToday,
      unreadMessages: unread.length,
      visibleProjects,
      cvDownloads,
      aiCalls7d,
      visitsSpark,
      messagesSpark,
      projectsSpark,
      cvSpark,
      visitsTrend: visitsTrendInfo.label,
      visitsTrendKind: visitsTrendInfo.kind,
      messagesTrend: messagesTrendInfo.label,
      messagesTrendKind: messagesTrendInfo.kind,
      projectsTrend,
      projectsTrendKind,
      cvTrend: cvTrendInfo.label,
      cvTrendKind: cvTrendInfo.kind,
    };
  }
}
