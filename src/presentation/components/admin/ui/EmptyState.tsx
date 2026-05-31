import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx("admin-empty", className)} role="status">
      {icon && (
        <div className="admin-empty-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="admin-empty-title">{title}</h3>
      {description && <p className="admin-empty-desc">{description}</p>}
      {action && <div className="admin-empty-action">{action}</div>}
    </div>
  );
}
