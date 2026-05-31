import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";
import type { ActivityEvent, ActivityEntity } from "@/domain/entities/ActivityEvent";

export class ListRecentActivity {
  constructor(private readonly repo: IActivityEventRepository) {}

  async execute(opts?: { limit?: number; entity?: ActivityEntity }): Promise<ActivityEvent[]> {
    return this.repo.listRecent({ limit: opts?.limit ?? 15, entity: opts?.entity });
  }
}
