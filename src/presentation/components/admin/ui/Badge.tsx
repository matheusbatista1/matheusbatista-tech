import type { ReactNode } from "react";

export type BadgeVariant = "neutral" | "accent" | "danger" | "success" | "warning";

export interface BadgeProps {
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ variant = "neutral", pulse = false, className, children }: BadgeProps) {
  return (
    <span className={cx("admin-badge", `admin-badge-${variant}`, pulse && "is-pulse", className)}>
      {pulse && <span className="admin-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
