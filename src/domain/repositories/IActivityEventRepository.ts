import type {
  ActivityEvent,
  NewActivityEvent,
  ActivityEntity,
} from "@/domain/entities/ActivityEvent";

export interface IActivityEventRepository {
  log(event: NewActivityEvent): Promise<ActivityEvent>;
  listRecent(opts?: { limit?: number; entity?: ActivityEntity }): Promise<ActivityEvent[]>;
}
