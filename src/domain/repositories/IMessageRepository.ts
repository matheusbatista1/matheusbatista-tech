import type { ContactMessage, NewContactMessage } from "../entities/ContactMessage";

export interface IMessageRepository {
  create(message: NewContactMessage): Promise<ContactMessage>;
  list(opts?: { unreadOnly?: boolean; archived?: boolean }): Promise<ContactMessage[]>;
  findById(id: string): Promise<ContactMessage | null>;
  markAsRead(id: string): Promise<void>;
  markUnread(id: string): Promise<void>;
  archive(id: string, archived: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
