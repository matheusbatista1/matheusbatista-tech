import type { SocialLink as PrismaSocialLink } from "@prisma/client";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type {
  ISocialLinkRepository,
  SocialLinkInput,
} from "@/domain/repositories/ISocialLinkRepository";
import { prisma } from "../db/prisma";

function toSocial(row: PrismaSocialLink): SocialLink {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    handle: row.handle,
    iconKey: row.iconKey,
    visible: row.visible,
    order: row.order,
  };
}

function toPrismaData(input: SocialLinkInput) {
  return {
    name: input.name,
    url: input.url,
    handle: input.handle,
    visible: input.visible,
    order: input.order,
  };
}

export class PrismaSocialLinkRepository implements ISocialLinkRepository {
  async list({ visibleOnly = false }: { visibleOnly?: boolean } = {}): Promise<SocialLink[]> {
    const rows = await prisma.socialLink.findMany({
      where: visibleOnly ? { visible: true } : undefined,
      orderBy: { order: "asc" },
    });
    return rows.map(toSocial);
  }

  async findById(id: string): Promise<SocialLink | null> {
    const row = await prisma.socialLink.findUnique({ where: { id } });
    return row ? toSocial(row) : null;
  }

  async create(input: SocialLinkInput): Promise<SocialLink> {
    const row = await prisma.socialLink.create({ data: toPrismaData(input) });
    return toSocial(row);
  }

  async update(id: string, input: SocialLinkInput): Promise<SocialLink> {
    const row = await prisma.socialLink.update({
      where: { id },
      data: toPrismaData(input),
    });
    return toSocial(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.socialLink.delete({ where: { id } });
  }
}
