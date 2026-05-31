"use client";

import { ChevronDown, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { anRelTime, deviceIcon } from "./helpers";
import { flagForCode } from "./countries";
import { AnKV } from "./AnKV";

export interface AnVisit {
  id: string;
  createdAt: string;
  path: string;
  locale: string | null;
  referrer: string | null;
  userAgent: string | null;
  ipHash: string;
  country: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  region: string | null;
  lat: number | null;
  lon: number | null;
  serverTz: string | null;
  clientTz: string | null;
  screenW: number | null;
  screenH: number | null;
  viewportW: number | null;
  viewportH: number | null;
  language: string | null;
  browser: string | null;
  browserVer: string | null;
  os: string | null;
  osVer: string | null;
  device: string | null;
  deviceModel: string | null;
  isBot: boolean | null;
  botName: string | null;
  botVer: string | null;
  refHost: string | null;
  refPath: string | null;
}

interface AnRowProps {
  visit: AnVisit;
  open: boolean;
  onToggle: () => void;
}

function formatDimension(w: number | null, h: number | null): string {
  if (w == null || h == null) return "—";
  return `${w}×${h}`;
}

export function AnRow({ visit, open, onToggle }: AnRowProps) {
  const t = useTranslations("admin.analytics");
  const isBot = visit.isBot === true;
  const DeviceIcon = deviceIcon(visit.device);
  const flag = flagForCode(visit.countryCode);
  const refLabel = visit.refHost || t("table.direct");
  const refIsDirect = !visit.refHost;
  const tzMismatch =
    !isBot &&
    visit.serverTz &&
    visit.clientTz &&
    visit.serverTz !== visit.clientTz &&
    visit.clientTz !== "—";

  return (
    <div className={`an-row-wrap${isBot ? "bot" : ""}${open ? "open" : ""}`}>
      <button
        type="button"
        className="an-row"
        onClick={onToggle}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <span className="an-c-when">{anRelTime(visit.createdAt, t)}</span>
        <span className="an-c-path">{visit.path}</span>
        <span className="an-c-loc">
          <span className="an-flag" aria-hidden="true">
            {flag}
          </span>
          <span>
            {visit.city ? `${visit.city}, ` : ""}
            {visit.countryName ?? visit.countryCode ?? "—"}
          </span>
        </span>
        <span className="an-c-br">
          <span>
            {visit.browser ?? "—"}
            {visit.browserVer ? ` ${visit.browserVer}` : ""}
          </span>
          <span className="an-c-os">{visit.os ?? ""}</span>
        </span>
        <span className="an-c-dev">
          <DeviceIcon className="an-dev-ico" aria-hidden="true" width={14} height={14} />
          {visit.device ?? "—"}
        </span>
        <span className="an-c-type">
          <span className={`an-badge ${isBot ? "bot" : "human"}`}>
            {isBot ? t("table.badge.bot") : t("table.badge.human")}
          </span>
        </span>
        <span className={`an-c-ref${refIsDirect ? "an-ref-direct" : ""}`}>{refLabel}</span>
        <span className="an-c-exp" aria-hidden="true">
          <ChevronDown width={14} height={14} />
        </span>
      </button>

      {open ? (
        <div className="an-detail">
          {isBot && visit.botName ? (
            <div className="an-detail-note bot">
              <AlertTriangle width={14} height={14} aria-hidden="true" />
              <span>{t("detail.identifiedAs", { name: visit.botName })}</span>
            </div>
          ) : null}
          {tzMismatch ? (
            <div className="an-detail-note warn">
              <AlertTriangle width={14} height={14} aria-hidden="true" />
              <span>
                {t("detail.tzMismatch", {
                  client: visit.clientTz ?? "—",
                  server: visit.serverTz ?? "—",
                })}
              </span>
            </div>
          ) : null}

          <div className="an-detail-grid">
            <AnKV label={t("detail.kv.timestamp")} value={visit.createdAt} mono />
            <AnKV label={t("detail.kv.path")} value={visit.path} mono />
            <AnKV
              label={t("detail.kv.country")}
              value={`${visit.countryName ?? "—"}${visit.countryCode ? ` (${visit.countryCode})` : ""}`}
            />
            <AnKV
              label={t("detail.kv.cityRegion")}
              value={`${visit.city ?? "—"}${visit.region ? `, ${visit.region}` : ""}`}
            />
            <AnKV
              label={t("detail.kv.latLon")}
              value={visit.lat != null && visit.lon != null ? `${visit.lat}, ${visit.lon}` : "—"}
              mono
            />
            <AnKV label={t("detail.kv.serverTz")} value={visit.serverTz ?? "—"} mono />
            <AnKV
              label={t("detail.kv.clientTz")}
              value={visit.clientTz ?? "—"}
              mono
              warn={tzMismatch ? true : undefined}
            />
            <AnKV
              label={t("detail.kv.screen")}
              value={formatDimension(visit.screenW, visit.screenH)}
              mono
            />
            <AnKV
              label={t("detail.kv.viewport")}
              value={formatDimension(visit.viewportW, visit.viewportH)}
              mono
            />
            <AnKV label={t("detail.kv.language")} value={visit.language ?? "—"} />
            <AnKV
              label={t("detail.kv.ipHash")}
              value={visit.ipHash.length > 24 ? `${visit.ipHash.slice(0, 24)}…` : visit.ipHash}
              mono
            />
          </div>

          {visit.userAgent ? (
            <div className="an-detail-ua">
              <div className="an-ua-h">{t("detail.kv.userAgent")}</div>
              <code>{visit.userAgent}</code>
            </div>
          ) : null}

          {visit.refHost ? (
            <div className="an-detail-ua">
              <div className="an-ua-h">{t("detail.kv.referrerUrl")}</div>
              <code>
                {visit.refHost}
                {visit.refPath ?? ""}
              </code>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
