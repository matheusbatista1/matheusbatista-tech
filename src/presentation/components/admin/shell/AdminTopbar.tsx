import { Bell, Eye, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AdminTopbarBreadcrumb } from "./AdminTopbarBreadcrumb";

export async function AdminTopbar({
  hasNotifications = false,
  actionsRight,
}: {
  hasNotifications?: boolean;
  actionsRight?: ReactNode;
}) {
  const tShell = await getTranslations("admin.shell");
  const tNav = await getTranslations("admin.nav");

  const crumbLabels: Record<string, string> = {
    inbox: tNav("inbox"),
    logs: tNav("logs"),
    hero: tNav("hero"),
    about: tNav("about"),
    projects: tNav("projects"),
    cv: tNav("cv"),
    social: tNav("social"),
    skills: tNav("skills"),
    settings: tNav("settings"),
  };

  return (
    <header className="admin-topbar" role="banner">
      <AdminTopbarBreadcrumb
        rootLabel={tShell("title")}
        dashboardLabel={tNav("dashboard")}
        labels={crumbLabels}
      />

      <div className="admin-topbar-spacer" />

      <div className="admin-topbar-search" role="search">
        <Search aria-hidden="true" />
        <input
          type="search"
          placeholder={tShell("search")}
          aria-label={tShell("search")}
          disabled
        />
        <kbd aria-hidden="true">{"⌘K"}</kbd>
      </div>

      <button type="button" className="admin-topbar-bell" aria-label="Notifications">
        <Bell aria-hidden="true" width={16} height={16} />
        {hasNotifications ? <span className="dot" aria-hidden="true" /> : null}
      </button>

      <Link
        href="/"
        target="_blank"
        rel="noreferrer"
        className="admin-topbar-bell"
        aria-label={tShell("viewPortfolio")}
      >
        <Eye aria-hidden="true" width={16} height={16} />
      </Link>

      {actionsRight}
    </header>
  );
}
