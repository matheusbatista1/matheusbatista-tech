import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { LogActivity } from "../activity/LogActivity";

export class ArchiveMessage {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(id: string, archived: boolean, actorEmail?: string | null): Promise<void> {
    await this.messageRepo.archive(id, archived);
    await this.logActivity.execute({
      action: "update",
      entity: "message",
      entityId: id,
      actorEmail: actorEmail ?? null,
      diff: { archived },
    });
  }
}
