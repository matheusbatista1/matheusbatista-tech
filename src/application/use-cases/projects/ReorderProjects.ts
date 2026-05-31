import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";
import type { LogActivity } from "../activity/LogActivity";

export class ReorderProjects {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(orderedIds: string[], actorEmail?: string | null): Promise<void> {
    const projects = await this.projectRepo.findManyByIds(orderedIds);
    const byId = new Map(projects.map((p) => [p.id, p]));

    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      if (!id) continue;
      const project = byId.get(id);
      if (!project) continue;

      await this.projectRepo.update(id, {
        slug: project.slug,
        name: project.name,
        url: project.url,
        liveUrl: project.liveUrl,
        description: project.description,
        pill: project.pill,
        tags: project.tags,
        images: project.images,
        order: index,
        deployed: project.deployed,
        visible: project.visible,
      });
    }

    await this.logActivity.execute({
      action: "update",
      entity: "project",
      actorEmail: actorEmail ?? null,
      diff: { reorder: orderedIds },
    });
  }
}
