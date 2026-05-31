import type { ContactMessage } from "@/domain/entities/ContactMessage";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";

export class GetMessage {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(id: string): Promise<ContactMessage | null> {
    return this.messageRepo.findById(id);
  }
}
