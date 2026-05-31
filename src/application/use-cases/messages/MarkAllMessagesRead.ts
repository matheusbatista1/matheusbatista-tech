import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { LogActivity } from "../activity/LogActivity";

export class MarkAllMessagesRead {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(actorEmail?: string | null): Promise<number> {
    const unread = await this.messageRepo.list({ unreadOnly: true });
    await Promise.all(unread.map((m) => this.messageRepo.markAsRead(m.id)));
    await this.logActivity.execute({
      action: "update",
      entity: "message",
      actorEmail: actorEmail ?? null,
      diff: { count: unread.length, action: "mark_all_read" },
    });
    return unread.length;
  }
}
