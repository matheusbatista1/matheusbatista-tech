import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { ISkillRepository } from "@/domain/repositories/ISkillRepository";
import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";
import type { ISiteSettingsRepository } from "@/domain/repositories/ISiteSettingsRepository";
import type { IProjectImageRepository } from "@/domain/repositories/IProjectImageRepository";
import type { ICVAssetRepository } from "@/domain/repositories/ICVAssetRepository";
import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";
import type { IBlobStorage } from "@/domain/services/IBlobStorage";
import type { LogActivity } from "../activity/LogActivity";

/**
 * DANGEROUS: zera os dados editáveis do site (projetos, skills, socials, CVs,
 * imagens de projeto e site settings). Não reseta o conteúdo (singleton Hero/About)
 * neste pass — o usuário precisa rodar `pnpm db:seed` manualmente para repopular.
 */
export class ResetSeed {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly skillRepo: ISkillRepository,
    private readonly socialRepo: ISocialLinkRepository,
    private readonly _contentRepo: IContentRepository,
    private readonly siteSettingsRepo: ISiteSettingsRepository,
    private readonly projectImageRepo: IProjectImageRepository,
    private readonly cvAssetRepo: ICVAssetRepository,
    private readonly _activityRepo: IActivityEventRepository,
    private readonly blobStorage: IBlobStorage,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(actorEmail?: string | null): Promise<void> {
    // 1) Projetos + imagens (best-effort delete no Blob)
    const projects = await this.projectRepo.list({ visibleOnly: false });
    for (const project of projects) {
      const images = await this.projectImageRepo.listByProject(project.id);
      for (const image of images) {
        try {
          await this.blobStorage.del(image.url);
        } catch (err) {
          console.error("[ResetSeed] falha ao remover blob de imagem", err);
        }
        await this.projectImageRepo.delete(image.id);
      }
      await this.projectRepo.delete(project.id);
    }

    // 2) CVs (best-effort delete no Blob)
    const cvs = await this.cvAssetRepo.list();
    for (const cv of cvs) {
      try {
        await this.blobStorage.del(cv.url);
      } catch (err) {
        console.error("[ResetSeed] falha ao remover blob de CV", err);
      }
      await this.cvAssetRepo.delete(cv.locale);
    }

    // 3) Skills
    const skills = await this.skillRepo.list();
    for (const skill of skills) {
      await this.skillRepo.delete(skill.id);
    }

    // 4) Social links
    const socials = await this.socialRepo.list({ visibleOnly: false });
    for (const social of socials) {
      await this.socialRepo.delete(social.id);
    }

    // 5) Site settings: upsert com defaults (não há delete na interface)
    await this.siteSettingsRepo.upsert({
      seoTitle: { en: "", pt: "", es: "" },
      seoDescription: { en: "", pt: "", es: "" },
      ogImageUrl: null,
      analyticsEnabled: true,
      aiFeaturesEnabled: true,
      maintenanceMode: false,
      contactEmail: null,
    });

    // Conteúdo (Hero/About) é singleton e não é zerado aqui — `pnpm db:seed` repopula.

    await this.logActivity.execute({
      action: "reset",
      entity: "settings",
      actorEmail: actorEmail ?? null,
      diff: { cleared: true },
    });
  }
}
