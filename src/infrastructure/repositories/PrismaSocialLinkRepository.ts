import type { SocialLink } from "@/domain/entities/SocialLink";
import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";
import { prisma } from "../db/prisma";

export class PrismaSocialLinkRepository implements ISocialLinkRepository {
  async list({ visibleOnly = false }: { visibleOnly?: boolean } = {}): Promise<SocialLink[]> {
    const rows = await prisma.socialLink.findMany({
      where: visibleOnly ? { visible: true } : undefined,
      orderBy: { order: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      handle: r.handle,
      visible: r.visible,
      order: r.order,
    }));
  }
}
