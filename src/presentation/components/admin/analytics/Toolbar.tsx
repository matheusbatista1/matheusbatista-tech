"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AN_COUNTRIES } from "./countries";

export type AnKind = "all" | "human" | "bot";

interface ToolbarProps {
  kind: AnKind;
  setKind: (k: AnKind) => void;
  query: string;
  setQuery: (q: string) => void;
  country: string;
  setCountry: (c: string) => void;
}

export function Toolbar({ kind, setKind, query, setQuery, country, setCountry }: ToolbarProps) {
  const t = useTranslations("admin.analytics");
  const items: Array<[AnKind, string]> = [
    ["all", t("filter.all")],
    ["human", t("filter.humans")],
    ["bot", t("filter.bots")],
  ];

  return (
    <div className="an-toolbar">
      <div className="an-seg">
        {items.map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`an-seg-btn${kind === k ? "on" : ""}`}
            onClick={() => setKind(k)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="an-search">
        <Search aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filter.searchPlaceholder")}
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear">
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <select
        className="an-country-sel"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        aria-label={t("filter.allCountries")}
      >
        <option value="all">{t("filter.allCountries")}</option>
        {AN_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
