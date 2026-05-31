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
  labels,
}: {
  rootLabel: string;
  labels: Record<string, string>;
}) {
  const pathname = usePathname();
  const crumbKey = useMemo(() => deriveCrumbKey(pathname), [pathname]);
  const crumbLabel = crumbKey ? (labels[crumbKey] ?? crumbKey) : null;

  return (
    <div className="admin-topbar-breadcrumb">
      <span className={crumbLabel ? "crumb-dim" : undefined}>{rootLabel}</span>
      {crumbLabel ? (
        <>
          <span className="sep" aria-hidden="true">
            /
          </span>
          <span>{crumbLabel}</span>
        </>
      ) : null}
    </div>
  );
}
