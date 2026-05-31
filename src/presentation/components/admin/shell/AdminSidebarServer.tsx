import { getTranslations } from "next-intl/server";
import { AdminSidebar } from "./AdminSidebar";
import type { AdminSidebarUser } from "./AdminSidebar";

export async function AdminSidebarServer({
  user,
  unreadCount,
  signOutAction,
  brandMark = "M",
}: {
  user: AdminSidebarUser;
  unreadCount?: number;
  signOutAction: () => Promise<void>;
  brandMark?: string;
}) {
  const tNav = await getTranslations("admin.nav");
  const tShell = await getTranslations("admin.shell");

  const sections = [
    {
      id: "overview",
      label: tNav("overview"),
      items: [
        { key: "dashboard" as const, href: "/admin", label: tNav("dashboard") },
        {
          key: "inbox" as const,
          href: "/admin/inbox",
          label: tNav("inbox"),
          badgeCount: unreadCount,
        },
      ],
    },
    {
      id: "content",
      label: tNav("content"),
      items: [
        { key: "hero" as const, href: "/admin/hero", label: tNav("hero") },
        { key: "about" as const, href: "/admin/about", label: tNav("about") },
        { key: "projects" as const, href: "/admin/projects", label: tNav("projects") },
        { key: "cv" as const, href: "/admin/cv", label: tNav("cv") },
      ],
    },
    {
      id: "configuration",
      label: tNav("configuration"),
      items: [
        { key: "social" as const, href: "/admin/social", label: tNav("social") },
        { key: "skills" as const, href: "/admin/skills", label: tNav("skills") },
        { key: "settings" as const, href: "/admin/settings", label: tNav("settings") },
      ],
    },
  ];

  return (
    <AdminSidebar
      sections={sections}
      brandMark={brandMark}
      brandLabel={tShell("title")}
      user={user}
      labels={{ signOut: tShell("signOut") }}
      signOutAction={signOutAction}
    />
  );
}
