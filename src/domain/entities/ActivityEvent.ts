export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "upload"
  | "ai_apply"
  | "reset";

export type ActivityEntity =
  | "project"
  | "skill"
  | "social"
  | "hero"
  | "about"
  | "cv"
  | "settings"
  | "message"
  | "asset";

export interface ActivityEvent {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string | null;
  diff: Record<string, unknown> | null;
  ip: string | null;
  createdAt: Date;
}

export type NewActivityEvent = Omit<ActivityEvent, "id" | "createdAt">;
