import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";

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

export class GetDashboardStats {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly projectRepo: IProjectRepository,
    private readonly activityRepo: IActivityEventRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const now = Date.now();
    const oneDayAgo = now - DAY_MS;
    const sevenDaysAgo = now - 7 * DAY_MS;
    const fourteenDaysAgo = now - 14 * DAY_MS;

    const [allMessages, unread, projects, activity] = await Promise.all([
      this.messageRepo.list({}),
      this.messageRepo.list({ unreadOnly: true }),
      this.projectRepo.list(),
      this.activityRepo.listRecent({ limit: 200 }),
    ]);

    const messagesToday = allMessages.filter((m) => m.createdAt.getTime() >= oneDayAgo).length;
    const aiCalls7d = activity.filter(
      (a) => a.action === "ai_apply" && a.createdAt.getTime() >= sevenDaysAgo,
    ).length;
    const visibleProjects = projects.filter((p) => p.visible).length;

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
    const messagesDelta = messagesLast7 - messagesPrev7;
    const messagesTrendPct =
      messagesPrev7 === 0
        ? messagesLast7 === 0
          ? 0
          : 100
        : Math.round((messagesDelta / messagesPrev7) * 100);
    const messagesTrendKind: TrendKind = messagesDelta < 0 ? "down" : "up";
    const messagesTrend = `${messagesDelta >= 0 ? "+" : ""}${messagesTrendPct}%`;

    const projectsSpark: number[] = Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const cutoff = now - monthsAgo * 30 * DAY_MS;
      return projects.filter((p) => p.createdAt && p.createdAt.getTime() <= cutoff).length;
    });
    const projectsTrend = "live";
    const projectsTrendKind: TrendKind = "up";

    const visitsSpark: number[] = Array.from({ length: 7 }, (_, i) => 820 + ((i * 47) % 380));
    const totalVisits = 0;
    const visitsTrend = "+0%";
    const visitsTrendKind: TrendKind = "up";

    const cvSpark: number[] = Array.from({ length: 7 }, (_, i) => 12 + ((i * 7) % 22));
    const cvDownloads = 0;
    const cvTrend = "+0%";
    const cvTrendKind: TrendKind = "up";

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
      visitsTrend,
      visitsTrendKind,
      messagesTrend,
      messagesTrendKind,
      projectsTrend,
      projectsTrendKind,
      cvTrend,
      cvTrendKind,
    };
  }
}
