import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";

export interface DashboardStats {
  messagesToday: number;
  unreadMessages: number;
  visibleProjects: number;
  aiCalls7d: number;
}

export class GetDashboardStats {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly projectRepo: IProjectRepository,
    private readonly activityRepo: IActivityEventRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const now = new Date().getTime();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

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

    return {
      messagesToday,
      unreadMessages: unread.length,
      visibleProjects,
      aiCalls7d,
    };
  }
}
