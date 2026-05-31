import type { ContactMessage as PrismaContactMessage } from "@prisma/client";
import type { ContactMessage, NewContactMessage } from "@/domain/entities/ContactMessage";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import { prisma } from "../db/prisma";

function toContactMessage(row: PrismaContactMessage): ContactMessage {
  return {
    id: row.id,
    from: row.from,
    email: row.email,
    subject: row.subject,
    body: row.body,
    read: row.read,
    archived: row.archived,
    createdAt: row.createdAt,
  };
}

export class PrismaMessageRepository implements IMessageRepository {
  async create(message: NewContactMessage): Promise<ContactMessage> {
    const row = await prisma.contactMessage.create({
      data: {
        from: message.from,
        email: message.email,
        subject: message.subject ?? null,
        body: message.body,
      },
    });
    return toContactMessage(row);
  }

  async list({
    unreadOnly = false,
    archived,
  }: { unreadOnly?: boolean; archived?: boolean } = {}): Promise<ContactMessage[]> {
    const where: { read?: boolean; archived?: boolean } = {};
    if (unreadOnly) where.read = false;
    if (archived !== undefined) where.archived = archived;
    const rows = await prisma.contactMessage.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toContactMessage);
  }

  async findById(id: string): Promise<ContactMessage | null> {
    const row = await prisma.contactMessage.findUnique({ where: { id } });
    return row ? toContactMessage(row) : null;
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  }

  async markUnread(id: string): Promise<void> {
    await prisma.contactMessage.update({ where: { id }, data: { read: false } });
  }

  async archive(id: string, archived: boolean): Promise<void> {
    await prisma.contactMessage.update({ where: { id }, data: { archived } });
  }

  async delete(id: string): Promise<void> {
    await prisma.contactMessage.delete({ where: { id } });
  }
}
