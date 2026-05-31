import type { ReactNode } from "react";
import { AdminShellProvider } from "./AdminShellContext";
import { AmbientBackground } from "./AmbientBackground";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider>
      <div className="admin-shell">
        <AmbientBackground />
        <div className="admin-grid">{children}</div>
      </div>
    </AdminShellProvider>
  );
}
