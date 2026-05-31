import { AdminSidebarServer } from "@/presentation/components/admin/shell/AdminSidebarServer";
import type { AdminSidebarUser } from "@/presentation/components/admin/shell/AdminSidebar";

export async function AdminSidebar({
  user,
  unreadCount,
  signOutAction,
}: {
  user: AdminSidebarUser;
  unreadCount?: number;
  signOutAction?: () => Promise<void>;
}) {
  async function defaultSignOut() {
    "use server";
    // No-op fallback; composition root (admin layout) should pass a real signOutAction.
  }

  return (
    <AdminSidebarServer
      user={user}
      unreadCount={unreadCount}
      signOutAction={signOutAction ?? defaultSignOut}
    />
  );
}
