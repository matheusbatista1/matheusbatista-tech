"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

function deriveCrumbKey(pathname: string): string | null {
  const stripped = pathname.replace(/^\/(en|pt|es)(?=\/|$)/, "") || "/";
  if (stripped === "/admin" || stripped === "/admin/") return null;
  const segments = stripped.split("/").filter(Boolean);
  // ["admin", "<crumb>", ...]
  return segments[1] ?? null;
}

export function AdminTopbarBreadcrumb({
  rootLabel,
  dashboardLabel,
  labels,
}: {
  rootLabel: string;
  dashboardLabel: string;
  labels: Record<string, string>;
}) {
  const pathname = usePathname();
  const crumbKey = useMemo(() => deriveCrumbKey(pathname), [pathname]);
  const trailingLabel = crumbKey ? (labels[crumbKey] ?? crumbKey) : dashboardLabel;

  return (
    <div className="admin-topbar-breadcrumb">
      <span className="crumb-dim">{rootLabel}</span>
      <span className="sep" aria-hidden="true">
        {"›"}
      </span>
      <span>{trailingLabel}</span>
    </div>
  );
}
