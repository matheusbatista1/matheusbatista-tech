"use client";

import { FileText } from "lucide-react";

import type { CVAsset } from "@/domain/entities/CVAsset";
import { LOCALES, type Locale } from "@/domain/value-objects/Locale";

interface CVOverviewProps {
  assets: Record<Locale, CVAsset | null>;
  active: Locale;
  notUploadedLabel: string;
  onSelect: (locale: Locale) => void;
}

export function CVOverview({ assets, active, notUploadedLabel, onSelect }: CVOverviewProps) {
  return (
    <div className="admin-cv-overview">
      {LOCALES.map((loc) => {
        const asset = assets[loc];
        const uploaded = !!asset;
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            className={`admin-cv-overview-card${isActive ? "is-active" : ""}`}
            onClick={() => onSelect(loc)}
            aria-pressed={isActive ? "true" : "false"}
          >
            <span className={`admin-cv-ficon${uploaded ? "is-uploaded" : ""}`} aria-hidden="true">
              <FileText size={16} />
            </span>
            <span className="admin-cv-overview-info">
              <span className="admin-cv-overview-locale">{loc.toUpperCase()}</span>
              <span
                className={`admin-cv-overview-filename${uploaded ? "" : "is-empty"}`}
                title={asset?.filename ?? notUploadedLabel}
              >
                {asset?.filename ?? notUploadedLabel}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
