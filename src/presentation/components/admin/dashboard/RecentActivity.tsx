import { getTranslations } from "next-intl/server";

import type { ActivityEvent } from "@/domain/entities/ActivityEvent";
import { Card } from "@/presentation/components/admin/ui/Card";

interface RecentActivityProps {
  events: ActivityEvent[];
  locale: string;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function formatRelative(date: Date, locale: string): string {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), "hour");
  if (abs < WEEK) return rtf.format(Math.round(diff / DAY), "day");
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
}

export async function RecentActivity({ events, locale }: RecentActivityProps) {
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  return (
    <Card padding="md" header={{ title: t("recentActivity") }}>
      {events.length === 0 ? (
        <p className="admin-empty">{t("noActivity")}</p>
      ) : (
        <ul className="admin-activity-rows">
          {events.map((ev) => (
            <li key={ev.id} className="admin-activity-row">
              <div className="admin-activity-row-main">
                <span className="admin-activity-action">{ev.action}</span>
                <span className="admin-activity-entity">{ev.entity}</span>
                {ev.actorEmail ? (
                  <span className="admin-activity-actor">{ev.actorEmail}</span>
                ) : null}
              </div>
              <span className="admin-activity-when">{formatRelative(ev.createdAt, locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
