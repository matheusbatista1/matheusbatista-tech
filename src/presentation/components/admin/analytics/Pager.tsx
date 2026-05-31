"use client";

import { useTranslations } from "next-intl";

interface PagerProps {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pager({ page, pageCount, onPrev, onNext }: PagerProps) {
  const t = useTranslations("admin.analytics");
  const current = pageCount === 0 ? 0 : page + 1;

  return (
    <div className="an-pager">
      <div className="an-pager-info">
        <span className="an-pager-cur">{t("pager.pageOf", { current, total: pageCount })}</span>
      </div>
      <div className="an-pager-btns">
        <button
          type="button"
          className="admin-btn admin-btn-ghost admin-btn-sm"
          onClick={onPrev}
          disabled={page <= 0}
        >
          <span className="admin-btn-label">{t("pager.prev")}</span>
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-ghost admin-btn-sm"
          onClick={onNext}
          disabled={page >= pageCount - 1}
        >
          <span className="admin-btn-label">{t("pager.next")}</span>
        </button>
      </div>
    </div>
  );
}
