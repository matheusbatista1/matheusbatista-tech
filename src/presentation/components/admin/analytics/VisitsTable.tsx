"use client";

import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnRow, type AnVisit } from "./AnRow";

interface VisitsTableProps {
  visits: AnVisit[];
  loading?: boolean;
  hasFilters: boolean;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  onClearFilters: () => void;
}

function SkeletonTable() {
  return (
    <div className="an-skeleton-table">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="an-sk-row" key={i}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function VisitsTable({
  visits,
  loading,
  hasFilters,
  expanded,
  toggleExpanded,
  onClearFilters,
}: VisitsTableProps) {
  const t = useTranslations("admin.analytics");

  if (loading) {
    return (
      <div className="card an-table-card">
        <SkeletonTable />
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="card an-table-card">
        <div className="an-empty">
          <div className="an-empty-ico" aria-hidden="true">
            <Activity />
          </div>
          <h4>{t("table.empty.title")}</h4>
          <p>{hasFilters ? t("table.empty.withFilter") : t("table.empty.noFilter")}</p>
          {hasFilters ? (
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={onClearFilters}
            >
              <span className="admin-btn-label">{t("filter.clearFilters")}</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="card an-table-card">
      <div className="an-thead" role="row">
        <span>{t("table.cols.when")}</span>
        <span>{t("table.cols.path")}</span>
        <span>{t("table.cols.location")}</span>
        <span>{t("table.cols.browser")}</span>
        <span>{t("table.cols.device")}</span>
        <span>{t("table.cols.type")}</span>
        <span>{t("table.cols.referrer")}</span>
        <span aria-hidden="true" />
      </div>
      <div className="an-tbody">
        {visits.map((v) => (
          <AnRow
            key={v.id}
            visit={v}
            open={expanded.has(v.id)}
            onToggle={() => toggleExpanded(v.id)}
          />
        ))}
      </div>
    </div>
  );
}
