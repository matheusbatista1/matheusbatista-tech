import type { ReactNode } from "react";

export function PageHead({
  title,
  lead,
  actions,
}: {
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="admin-pagehead">
      <div>
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}
