import type { ContactMessage, NewContactMessage } from "@/domain/entities/ContactMessage";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";

export class SendContactMessage {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(input: NewContactMessage): Promise<ContactMessage> {
    return this.messageRepo.create(input);
  }
}
