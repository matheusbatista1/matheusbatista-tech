import { Eye } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AdminTopbarBreadcrumb } from "./AdminTopbarBreadcrumb";
import { AdminMobileNavButton } from "./AdminMobileNav";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { NotificationsDropdown } from "./NotificationsDropdown";

export async function AdminTopbar({ actionsRight }: { actionsRight?: ReactNode }) {
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

  const paletteItems = [
    { key: "dashboard", href: "/admin", label: tNav("dashboard") },
    { key: "inbox", href: "/admin/inbox", label: tNav("inbox") },
    { key: "analytics", href: "/admin/analytics", label: tNav("analytics") },
    { key: "logs", href: "/admin/logs", label: tNav("logs") },
    { key: "hero", href: "/admin/hero", label: tNav("hero") },
    { key: "about", href: "/admin/about", label: tNav("about") },
    { key: "projects", href: "/admin/projects", label: tNav("projects") },
    { key: "skills", href: "/admin/skills", label: tNav("skills") },
    { key: "social", href: "/admin/social", label: tNav("social") },
    { key: "cv", href: "/admin/cv", label: tNav("cv") },
    { key: "settings", href: "/admin/settings", label: tNav("settings") },
  ];

  return (
    <header className="admin-topbar" role="banner">
      <AdminMobileNavButton label={tShell("title")} />
      <AdminTopbarBreadcrumb
        rootLabel={tShell("title")}
        dashboardLabel={tNav("dashboard")}
        labels={crumbLabels}
      />

      <div className="admin-topbar-spacer" />

      <AdminCommandPalette items={paletteItems} placeholder={tShell("search")} />

      <NotificationsDropdown />

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
