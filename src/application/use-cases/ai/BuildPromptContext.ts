import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";
import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";
import type { PromptContext } from "@/domain/entities/ai/PromptContext";

const DESCRIPTION_MAX_CHARS = 150;

export class BuildPromptContext {
  constructor(
    private readonly contentRepo: IContentRepository,
    private readonly projectRepo: IProjectRepository,
    private readonly skillRepo: ISkillRepository,
    private readonly socialRepo: ISocialLinkRepository,
  ) {}

  async execute(locale: Locale): Promise<PromptContext> {
    const [content, projects, skillsGrouped, socials] = await Promise.all([
      this.contentRepo.get(),
      this.projectRepo.list({ visibleOnly: true }),
      this.skillRepo.groupedByCategory(),
      this.socialRepo.list({ visibleOnly: true }),
    ]);

    if (!content) {
      throw new Error("SiteContent not initialized. Run `pnpm db:seed`.");
    }

    const { hero, about } = content;

    return {
      name: `${hero.firstName} ${hero.lastName}`,
      subtitle: pickLocalized(hero.subtitle, locale),
      tagline: pickLocalized(hero.tagline, locale),
      about: pickLocalized(about.body, locale),
      currently: pickLocalized(about.currently, locale),
      role: about.role,
      location: about.location,
      years: about.years,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: pickLocalized(p.description, locale).slice(0, DESCRIPTION_MAX_CHARS),
        tags: p.tags,
        pill: p.pill,
        deployed: p.deployed,
      })),
      skills: Object.fromEntries(
        Object.entries(skillsGrouped).map(([cat, list]) => [cat, list.map((s) => s.name)]),
      ),
      social: socials.map((s) => ({ name: s.name, handle: s.handle, url: s.url })),
    };
  }
}
