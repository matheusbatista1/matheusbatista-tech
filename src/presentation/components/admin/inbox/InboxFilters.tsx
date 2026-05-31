import Link from "next/link";
import { getTranslations } from "next-intl/server";

export type InboxFilter = "all" | "unread";

interface InboxFiltersProps {
  locale: string;
  current: InboxFilter;
  totalCount: number;
  unreadCount: number;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export async function InboxFilters({
  locale,
  current,
  totalCount,
  unreadCount,
}: InboxFiltersProps) {
  const t = await getTranslations("admin.inbox");

  const items: Array<{ key: InboxFilter; label: string; count: number }> = [
    { key: "all", label: t("all"), count: totalCount },
    { key: "unread", label: t("unread"), count: unreadCount },
  ];

  return (
    <nav className="admin-inbox-filter-pill" role="tablist" aria-label={t("title")}>
      {items.map(({ key, label, count }) => {
        const isActive = key === current;
        return (
          <Link
            key={key}
            href={`/${locale}/admin/inbox?filter=${key}`}
            role="tab"
            aria-selected={isActive}
            className={cx(
              "admin-btn",
              "admin-btn-sm",
              isActive ? "admin-btn-primary" : "admin-btn-ghost",
            )}
          >
            <span className="admin-btn-label">
              {label} {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
