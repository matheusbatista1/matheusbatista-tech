import type { ContactMessage, NewContactMessage } from "@/domain/entities/ContactMessage";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import { isPrismaTransientError, withRetry } from "@/application/lib/retry";

export class SendContactMessage {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(input: NewContactMessage): Promise<ContactMessage> {
    return withRetry(() => this.messageRepo.create(input), {
      isRetryable: isPrismaTransientError,
    });
  }
}
