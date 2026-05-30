import type { ContactMessage, NewContactMessage } from "@/domain/entities/ContactMessage";
import type { IMessageRepository } from "@/domain/repositories/IMessageRepository";
import { prisma } from "../db/prisma";

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
    return row;
  }

  async list({ unreadOnly = false }: { unreadOnly?: boolean } = {}): Promise<ContactMessage[]> {
    return prisma.contactMessage.findMany({
      where: unreadOnly ? { read: false } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  }

  async delete(id: string): Promise<void> {
    await prisma.contactMessage.delete({ where: { id } });
  }
}
