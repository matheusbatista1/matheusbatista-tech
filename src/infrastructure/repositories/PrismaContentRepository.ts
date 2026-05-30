import type { HeroContent } from "@/domain/entities/HeroContent";
import type { AboutContent } from "@/domain/entities/AboutContent";
import type {
  IContentRepository,
  SiteContent,
  SiteSettings,
} from "@/domain/repositories/IContentRepository";
import { prisma } from "../db/prisma";

export class PrismaContentRepository implements IContentRepository {
  async get(): Promise<SiteContent | null> {
    const row = await prisma.siteContent.findUnique({ where: { id: "singleton" } });
    if (!row) return null;
    return {
      hero: row.hero as unknown as HeroContent,
      about: row.about as unknown as AboutContent,
      settings: row.settings as unknown as SiteSettings,
    };
  }

  async updateHero(hero: HeroContent): Promise<void> {
    await prisma.siteContent.update({
      where: { id: "singleton" },
      data: { hero: hero as unknown as object },
    });
  }

  async updateAbout(about: AboutContent): Promise<void> {
    await prisma.siteContent.update({
      where: { id: "singleton" },
      data: { about: about as unknown as object },
    });
  }
}
