import type { ReactNode } from "react";
import { AdminTopbar as ShellAdminTopbar } from "@/presentation/components/admin/shell/AdminTopbar";

export async function AdminTopbar({
  hasNotifications = false,
  actionsRight,
}: {
  title?: string;
  hasNotifications?: boolean;
  actionsRight?: ReactNode;
}) {
  return <ShellAdminTopbar hasNotifications={hasNotifications} actionsRight={actionsRight} />;
}
