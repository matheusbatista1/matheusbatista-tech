"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UAParser } from "ua-parser-js";
import { FileText } from "lucide-react";
import { flagForCode } from "./countries";
import { anRelTime } from "./helpers";
import "./cv-downloads.css";

interface CVDownloadRow {
  id: string;
  createdAt: string;
  locale: string;
  country: string | null;
  city: string | null;
  referrer: string | null;
  userAgent: string | null;
}

export function CVDownloadsPanel() {
  const t = useTranslations("admin.analytics");
  const [rows, setRows] = useState<CVDownloadRow[] | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/cv-downloads?range=all&perPage=50")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setRows(data.entries ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {
        if (active) setRows([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card cvd-card">
      <header className="cvd-head">
        <div className="cvd-title">
          <FileText width={15} height={15} aria-hidden="true" />
          <h3>{t("cvDownloads.title")}</h3>
        </div>
        <span className="cvd-total">{total}</span>
      </header>

      {rows === null ? (
        <div className="cvd-empty">{t("cvDownloads.loading")}</div>
      ) : rows.length === 0 ? (
        <div className="cvd-empty">{t("cvDownloads.empty")}</div>
      ) : (
        <div className="cvd-table">
          <div className="cvd-thead" role="row">
            <span>{t("table.cols.when")}</span>
            <span>{t("cvDownloads.cols.lang")}</span>
            <span>{t("table.cols.location")}</span>
            <span>{t("table.cols.browser")}</span>
            <span>{t("table.cols.referrer")}</span>
          </div>
          {rows.map((d) => {
            const ua = d.userAgent ? new UAParser(d.userAgent).getResult() : null;
            const browser = ua?.browser?.name ?? "—";
            const device = ua?.device?.type ?? "desktop";
            let refHost = t("table.direct");
            if (d.referrer) {
              try {
                refHost = new URL(d.referrer).hostname;
              } catch {
                refHost = d.referrer;
              }
            }
            return (
              <div className="cvd-row" key={d.id}>
                <span>{anRelTime(d.createdAt, t)}</span>
                <span className="cvd-lang">{d.locale.toUpperCase()}</span>
                <span className="cvd-loc">
                  <span aria-hidden="true">{flagForCode(d.country)}</span>
                  <span>
                    {d.city ? `${d.city}, ` : ""}
                    {d.country ?? "—"}
                  </span>
                </span>
                <span>
                  {browser}
                  {device !== "desktop" ? ` · ${device}` : ""}
                </span>
                <span className="cvd-ref">{refHost}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
