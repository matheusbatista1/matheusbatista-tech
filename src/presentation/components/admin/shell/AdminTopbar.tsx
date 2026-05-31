import { Bell, Search } from "lucide-react";
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
      <AdminTopbarBreadcrumb rootLabel={tShell("title")} labels={crumbLabels} />

      <div className="admin-topbar-spacer" />

      <div className="admin-topbar-search" role="search">
        <Search aria-hidden="true" />
        <input
          type="search"
          placeholder={tShell("search")}
          aria-label={tShell("search")}
          disabled
        />
        <kbd aria-hidden="true">Ctrl K</kbd>
      </div>

      <button type="button" className="admin-topbar-bell" aria-label="Notifications">
        <Bell aria-hidden="true" width={16} height={16} />
        {hasNotifications ? <span className="dot" aria-hidden="true" /> : null}
      </button>

      {actionsRight}
    </header>
  );
}
