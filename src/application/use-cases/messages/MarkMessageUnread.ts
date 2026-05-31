import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { LogActivity } from "../activity/LogActivity";

export class MarkMessageUnread {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(id: string, actorEmail?: string | null): Promise<void> {
    await this.messageRepo.markUnread(id);
    await this.logActivity.execute({
      action: "update",
      entity: "message",
      entityId: id,
      actorEmail: actorEmail ?? null,
      diff: { read: false },
    });
  }
}
