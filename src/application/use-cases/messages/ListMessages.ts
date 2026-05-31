import type { ContactMessage } from "@/domain/entities/ContactMessage";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";

export class ListMessages {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(opts?: { unreadOnly?: boolean; archived?: boolean }): Promise<ContactMessage[]> {
    return this.messageRepo.list(opts);
  }
}
