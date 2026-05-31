import type { ReactNode } from "react";

export function AdminContent({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className="admin-content" data-wide={wide ? "true" : "false"}>
      {children}
    </main>
  );
}
