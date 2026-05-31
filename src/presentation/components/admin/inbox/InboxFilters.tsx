"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export type InboxFilter = "unread" | "all" | "archived";

interface InboxFiltersProps {
  locale: string;
  current: InboxFilter;
}

const FILTERS: ReadonlyArray<InboxFilter> = ["unread", "all", "archived"];

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export function InboxFilters({ locale, current }: InboxFiltersProps) {
  const t = useTranslations("admin.inbox");

  return (
    <nav className="admin-tabs admin-inbox-filters" role="tablist" aria-label={t("title")}>
      {FILTERS.map((value) => {
        const isActive = value === current;
        return (
          <Link
            key={value}
            href={`/${locale}/admin/inbox?filter=${value}`}
            role="tab"
            aria-selected={isActive}
            className={cx("admin-tabs-item", isActive && "is-active")}
          >
            {t(value)}
          </Link>
        );
      })}
    </nav>
  );
}
