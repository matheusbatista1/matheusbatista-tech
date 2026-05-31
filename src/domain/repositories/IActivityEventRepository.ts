import type {
  ActivityEvent,
  ActivityAction,
  NewActivityEvent,
  ActivityEntity,
} from "@/domain/entities/ActivityEvent";

export interface ListFilteredActivityOptions {
  entity?: ActivityEntity | ActivityEntity[];
  action?: ActivityAction | ActivityAction[];
  actorEmail?: string;
  search?: string;
  since?: Date;
  until?: Date;
  limit?: number;
  offset?: number;
}

export interface IActivityEventRepository {
  log(event: NewActivityEvent): Promise<ActivityEvent>;
  listRecent(opts?: { limit?: number; entity?: ActivityEntity }): Promise<ActivityEvent[]>;
  listFiltered(
    opts?: ListFilteredActivityOptions,
  ): Promise<{ entries: ActivityEvent[]; total: number }>;
}
