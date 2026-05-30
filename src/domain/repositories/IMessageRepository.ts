import type { ContactMessage, NewContactMessage } from "../entities/ContactMessage";

export interface IMessageRepository {
  create(message: NewContactMessage): Promise<ContactMessage>;
  list(opts?: { unreadOnly?: boolean }): Promise<ContactMessage[]>;
  markAsRead(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
