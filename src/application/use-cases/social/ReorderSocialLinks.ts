import type { ISocialLinkRepository } from "@/domain/repositories/ISocialLinkRepository";
import type { LogActivity } from "../activity/LogActivity";

export class ReorderSocialLinks {
  constructor(
    private readonly socialRepo: ISocialLinkRepository,
    private readonly logActivity: LogActivity,
  ) {}

  async execute(orderedIds: string[], actorEmail?: string | null): Promise<void> {
    const existing = await this.socialRepo.list({ visibleOnly: false });
    const byId = new Map(existing.map((s) => [s.id, s]));

    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      if (!id) continue;
      const social = byId.get(id);
      if (!social) continue;

      await this.socialRepo.update(id, {
        name: social.name,
        url: social.url,
        handle: social.handle,
        iconKey: social.iconKey,
        visible: social.visible,
        order: index,
      });
    }

    await this.logActivity.execute({
      action: "update",
      entity: "social",
      actorEmail: actorEmail ?? null,
      diff: { reorder: orderedIds },
    });
  }
}
