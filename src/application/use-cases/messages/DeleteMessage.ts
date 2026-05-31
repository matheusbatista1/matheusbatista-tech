import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import type { LogActivity } from "../activity/LogActivity";

export class DeleteMessage {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(id: string, actorEmail?: string | null): Promise<void> {
    await this.messageRepo.delete(id);
    await this.logActivity.execute({
      action: "delete",
      entity: "message",
      entityId: id,
      actorEmail: actorEmail ?? null,
    });
  }
}
