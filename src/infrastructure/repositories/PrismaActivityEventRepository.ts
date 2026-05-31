import type { Prisma } from "@prisma/client";
import type {
  ActivityEvent,
  ActivityAction,
  ActivityEntity,
  NewActivityEvent,
} from "@/domain/entities/ActivityEvent";
import type {
  IActivityEventRepository,
  ListFilteredActivityOptions,
} from "@/domain/repositories/IActivityEventRepository";
import { prisma } from "../db/prisma";

function toActivityEvent(row: {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  diff: unknown;
  ip: string | null;
  createdAt: Date;
}): ActivityEvent {
  return {
    id: row.id,
    actorId: row.actorId,
    actorEmail: row.actorEmail,
    action: row.action as ActivityAction,
    entity: row.entity as ActivityEntity,
    entityId: row.entityId,
    diff: (row.diff as Record<string, unknown> | null) ?? null,
    ip: row.ip,
    createdAt: row.createdAt,
  };
}

export class PrismaActivityEventRepository implements IActivityEventRepository {
  async log(event: NewActivityEvent): Promise<ActivityEvent> {
    const row = await prisma.activityEvent.create({
      data: {
        actorId: event.actorId,
        actorEmail: event.actorEmail,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        diff: (event.diff ?? undefined) as unknown as object | undefined,
        ip: event.ip,
      },
    });
    return toActivityEvent(row);
  }

  async listRecent({
    limit = 50,
    entity,
  }: { limit?: number; entity?: ActivityEntity } = {}): Promise<ActivityEvent[]> {
    const rows = await prisma.activityEvent.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toActivityEvent);
  }

  async listFiltered(
    opts: ListFilteredActivityOptions = {},
  ): Promise<{ entries: ActivityEvent[]; total: number }> {
    const { entity, action, actorEmail, search, since, until, limit = 50, offset = 0 } = opts;

    const and: Prisma.ActivityEventWhereInput[] = [];

    if (entity) {
      and.push({ entity: Array.isArray(entity) ? { in: entity } : entity });
    }
    if (action) {
      and.push({ action: Array.isArray(action) ? { in: action } : action });
    }
    if (actorEmail) {
      and.push({ actorEmail });
    }
    if (since || until) {
      const range: Prisma.DateTimeFilter = {};
      if (since) range.gte = since;
      if (until) range.lte = until;
      and.push({ createdAt: range });
    }
    if (search && search.trim().length > 0) {
      and.push({
        OR: [
          { actorEmail: { contains: search, mode: "insensitive" } },
          { entityId: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.ActivityEventWhereInput = and.length > 0 ? { AND: and } : {};

    const [rows, total] = await Promise.all([
      prisma.activityEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.activityEvent.count({ where }),
    ]);

    return { entries: rows.map(toActivityEvent), total };
  }
}
