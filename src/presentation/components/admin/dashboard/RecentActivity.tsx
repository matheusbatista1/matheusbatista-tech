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

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function iconFor(ev: ActivityEvent): React.ReactNode {
  switch (ev.entity) {
    case "message":
      return <MailIcon />;
    case "project":
      return <FolderIcon />;
    case "cv":
    case "asset":
      return <DownloadIcon />;
    case "hero":
    case "about":
      return <EditIcon />;
    case "skill":
      return <SparkIcon />;
    case "social":
      return <UserIcon />;
    case "settings":
      return <EditIcon />;
    default:
      return <ActivityIcon />;
  }
}

interface NarrativeArgs {
  ev: ActivityEvent;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function narrate({ ev, t }: NarrativeArgs): string {
  const diff = (ev.diff ?? {}) as Record<string, unknown>;
  const name = (typeof diff.name === "string" && diff.name) || ev.entityId || "—";
  const subject = (typeof diff.subject === "string" && diff.subject) || "";
  const from = (typeof diff.from === "string" && diff.from) || "";

  if (ev.entity === "message" && ev.action === "create") {
    if (subject) {
      return t("admin.dashboard.activity.newMessageFromAbout", {
        name: from || name,
        subject,
      });
    }
    return t("admin.dashboard.activity.newMessageFrom", { name: from || name });
  }

  if (ev.entity === "project") {
    if (ev.action === "create") return t("admin.dashboard.activity.projectCreated", { name });
    if (ev.action === "update") return t("admin.dashboard.activity.projectUpdated", { name });
    if (ev.action === "delete") return t("admin.dashboard.activity.projectDeleted", { name });
    if (ev.action === "publish") return t("admin.dashboard.activity.projectPublished", { name });
  }

  if (ev.entity === "skill") {
    if (ev.action === "create") return t("admin.dashboard.activity.skillCreated", { name });
    if (ev.action === "update") return t("admin.dashboard.activity.skillUpdated", { name });
    if (ev.action === "delete") return t("admin.dashboard.activity.skillDeleted", { name });
  }

  if (ev.entity === "social") {
    if (ev.action === "create") return t("admin.dashboard.activity.socialCreated");
    if (ev.action === "update") return t("admin.dashboard.activity.socialUpdated");
    if (ev.action === "delete") return t("admin.dashboard.activity.socialDeleted");
  }

  if (ev.entity === "hero" && ev.action === "update") {
    return t("admin.dashboard.activity.heroUpdated");
  }
  if (ev.entity === "about" && ev.action === "update") {
    return t("admin.dashboard.activity.aboutUpdated");
  }
  if (ev.entity === "settings" && ev.action === "update") {
    return t("admin.dashboard.activity.settingsUpdated");
  }

  if (ev.entity === "cv") {
    if (ev.action === "upload") return t("admin.dashboard.activity.cvUploaded");
    if (ev.action === "delete") return t("admin.dashboard.activity.cvDeleted");
  }

  if (ev.entity === "asset") {
    if (ev.action === "upload") return t("admin.dashboard.activity.assetUploaded");
    if (ev.action === "delete") return t("admin.dashboard.activity.assetDeleted");
  }

  if (ev.action === "ai_apply") {
    return t("admin.dashboard.activity.aiApplied", { entity: ev.entity });
  }

  if (ev.action === "reset") {
    return t("admin.dashboard.activity.reset", { entity: ev.entity });
  }

  return t("admin.dashboard.activity.fallback", { action: ev.action, entity: ev.entity });
}

export async function RecentActivity({ events, locale }: RecentActivityProps) {
  const t = await getTranslations({ locale });
  const tDash = await getTranslations({ locale, namespace: "admin.dashboard" });

  return (
    <Card padding="md" header={{ title: tDash("recentActivity") }}>
      {events.length === 0 ? (
        <p className="admin-empty">{tDash("noActivity")}</p>
      ) : (
        <ul className="admin-activity-rows">
          {events.map((ev) => (
            <li key={ev.id} className="admin-activity-item">
              <div className="admin-activity-ico" aria-hidden="true">
                {iconFor(ev)}
              </div>
              <div className="admin-activity-text">
                <div className="admin-activity-what">{narrate({ ev, t })}</div>
                <div className="admin-activity-when">{formatRelative(ev.createdAt, locale)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
