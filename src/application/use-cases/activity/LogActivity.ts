import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";
import type { ActivityAction, ActivityEntity } from "@/domain/entities/ActivityEvent";

export interface LogActivityInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string | null;
  diff?: Record<string, unknown> | null;
  ip?: string | null;
}

export class LogActivity {
  constructor(private readonly repo: IActivityEventRepository) {}

  async execute(input: LogActivityInput): Promise<void> {
    try {
      await this.repo.log({
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        diff: input.diff ?? null,
        ip: input.ip ?? null,
      });
    } catch (err) {
      console.error("[LogActivity] falha ao registrar atividade", err);
    }
  }
}
