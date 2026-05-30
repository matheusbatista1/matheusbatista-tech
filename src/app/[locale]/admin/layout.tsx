import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // TODO(auth): aplicar gate aqui (redirect se nao autenticado).
  //   Decisao do provider pendente — vide CLAUDE.md secao 10.
  return (
    <div className="bg-bg-elev min-h-screen">
      <div className="border-b border-[color:var(--line)] px-6 py-4">
        <span className="text-text-mute font-mono text-xs tracking-widest uppercase">
          Admin · matheusbatista.tech
        </span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
