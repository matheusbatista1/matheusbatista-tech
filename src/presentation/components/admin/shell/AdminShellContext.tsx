"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type AdminShellContextValue = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((v) => !v), []);

  const value = useMemo<AdminShellContextValue>(
    () => ({ drawerOpen, openDrawer, closeDrawer, toggleDrawer }),
    [drawerOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell(): AdminShellContextValue {
  const ctx = useContext(AdminShellContext);
  if (!ctx) {
    throw new Error("useAdminShell must be used within AdminShellProvider");
  }
  return ctx;
}
