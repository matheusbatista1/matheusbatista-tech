"use client";

import { Menu } from "lucide-react";
import { useAdminShell } from "./AdminShellContext";

export function AdminMobileNavButton({ label }: { label: string }) {
  const { toggleDrawer } = useAdminShell();
  return (
    <button type="button" className="admin-topbar-menu" onClick={toggleDrawer} aria-label={label}>
      <Menu width={18} height={18} aria-hidden="true" />
    </button>
  );
}

export function AdminMobileNavScrim() {
  const { drawerOpen, closeDrawer } = useAdminShell();
  if (!drawerOpen) return null;
  return <div className="admin-scrim" onClick={closeDrawer} aria-hidden="true" />;
}
