"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Mail,
  ScrollText,
  Home,
  Folder,
  Sparkles,
  User,
  Link2,
  FileText,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useAdminShell } from "./AdminShellContext";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type AdminNavItemKey =
  | "dashboard"
  | "inbox"
  | "analytics"
  | "logs"
  | "hero"
  | "projects"
  | "skills"
  | "about"
  | "social"
  | "cv"
  | "settings";

type SidebarItem = {
  key: AdminNavItemKey;
  href: string;
  label: string;
  badgeCount?: number;
};

type SidebarSection = {
  id: string;
  label: string;
  items: SidebarItem[];
};

export type AdminSidebarLabels = {
  signOut: string;
};

export type AdminSidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const ICONS: Record<AdminNavItemKey, IconComponent> = {
  dashboard: LayoutGrid,
  inbox: Mail,
  analytics: BarChart3,
  logs: ScrollText,
  hero: Home,
  projects: Folder,
  skills: Sparkles,
  about: User,
  social: Link2,
  cv: FileText,
  settings: Settings,
};

function normalizePath(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|pt|es)(?=\/|$)/, "");
  return stripped || "/";
}

function isActive(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  if (href === "/admin") {
    return current === "/admin" || current === "/admin/";
  }
  return current === href || current.startsWith(`${href}/`);
}

function initialsOf(name?: string | null, email?: string | null): string {
  const source = (name ?? email ?? "?").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

export function AdminSidebar({
  sections,
  brandMark,
  brandLabel,
  user,
  labels,
  signOutAction,
}: {
  sections: SidebarSection[];
  brandMark: string;
  brandLabel: string;
  user: AdminSidebarUser;
  labels: AdminSidebarLabels;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { drawerOpen, closeDrawer } = useAdminShell();

  return (
    <aside
      className="admin-sidebar"
      data-open={drawerOpen ? "true" : "false"}
      aria-label={brandLabel}
    >
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-mark" aria-hidden="true">
          {brandMark}
        </div>
        <div className="admin-sidebar-brand-info">
          <span className="t">Portfolio</span>
          <span className="s">{brandLabel}</span>
        </div>
      </div>

      <nav aria-label={brandLabel}>
        {sections.map((section) => (
          <div key={section.id} className="admin-sidebar-section">
            <div className="admin-sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = ICONS[item.key];
              const active = isActive(pathname, item.href);
              const showBadge = typeof item.badgeCount === "number" && item.badgeCount > 0;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="admin-sidebar-link"
                  data-active={active ? "true" : "false"}
                  aria-current={active ? "page" : undefined}
                  onClick={closeDrawer}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                  {showBadge ? (
                    <span className="admin-sidebar-badge" aria-label={`${item.badgeCount} unread`}>
                      {item.badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <SidebarFooter user={user} labels={labels} signOutAction={signOutAction} />
    </aside>
  );
}

function SidebarFooter({
  user,
  labels,
  signOutAction,
}: {
  user: AdminSidebarUser;
  labels: AdminSidebarLabels;
  signOutAction: () => Promise<void>;
}): ReactNode {
  return (
    <div className="admin-sidebar-footer">
      <span className="avatar" aria-hidden="true">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" />
        ) : (
          initialsOf(user.name, user.email)
        )}
      </span>
      <span className="info">
        <span className="name">{user.name ?? user.email ?? ""}</span>
        {user.email ? <span className="email">{user.email}</span> : null}
      </span>
      <form action={signOutAction}>
        <button type="submit" aria-label={labels.signOut} className="signout-icon">
          <LogOut aria-hidden="true" width={16} height={16} />
        </button>
      </form>
    </div>
  );
}
