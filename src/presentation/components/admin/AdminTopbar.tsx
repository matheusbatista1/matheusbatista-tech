import type { ReactNode } from "react";
import { AdminTopbar as ShellAdminTopbar } from "@/presentation/components/admin/shell/AdminTopbar";

export async function AdminTopbar({ actionsRight }: { title?: string; actionsRight?: ReactNode }) {
  return <ShellAdminTopbar actionsRight={actionsRight} />;
}
