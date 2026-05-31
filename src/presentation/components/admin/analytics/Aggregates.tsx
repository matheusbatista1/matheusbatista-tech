"use client";

import { Globe, ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import { flagForCode, getCountryByCode } from "./countries";

export interface TopCountry {
  countryCode: string | null;
  count: number;
}

export interface TopPath {
  path: string;
  count: number;
}

interface AggregatesProps {
  topCountries: TopCountry[];
  topPaths: TopPath[];
  country: string;
  setCountry: (code: string) => void;
  loading?: boolean;
}

function SkeletonRows({ n }: { n: number }) {
  return (
    <div className="an-sk-bars">
      {Array.from({ length: n }).map((_, i) => (
        <div className="an-sk-bar" key={i}>
          <span className="an-sk-line w40" />
          <span className="an-sk-line flex" />
        </div>
      ))}
    </div>
  );
}

export function Aggregates({
  topCountries,
  topPaths,
  country,
  setCountry,
  loading,
}: AggregatesProps) {
  const t = useTranslations("admin.analytics");
  const maxCountry = topCountries.length ? topCountries[0]!.count : 1;
  const maxPath = topPaths.length ? topPaths[0]!.count : 1;

  return (
    <div className="an-aggs">
      <div className="card an-agg">
        <div className="card-head">
          <h3>
            <Globe style={{ width: 14, height: 14 }} aria-hidden="true" /> {t("agg.topCountries")}
          </h3>
        </div>
        {loading ? (
          <SkeletonRows n={6} />
        ) : (
          <div className="an-bars">
            {topCountries.map(({ countryCode, count }) => {
              const code = countryCode ?? "—";
              const country_ = getCountryByCode(countryCode);
              const name = country_?.name ?? code;
              const flag = flagForCode(countryCode);
              const isOn = country === code;
              return (
                <button
                  key={code}
                  type="button"
                  className={`an-bar-row${isOn ? "on" : ""}`}
                  onClick={() => setCountry(isOn ? "all" : code)}
                >
                  <span className="an-flag" aria-hidden="true">
                    {flag}
                  </span>
                  <span className="an-bar-name">{name}</span>
                  <span className="an-bar-track">
                    <span
                      className="an-bar-fill"
                      style={{ width: `${(count / maxCountry) * 100}%` }}
                    />
                  </span>
                  <span className="an-bar-n">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="card an-agg">
        <div className="card-head">
          <h3>
            <ScrollText style={{ width: 14, height: 14 }} aria-hidden="true" /> {t("agg.topPages")}
          </h3>
        </div>
        {loading ? (
          <SkeletonRows n={7} />
        ) : (
          <div className="an-bars">
            {topPaths.map(({ path, count }) => (
              <div key={path} className="an-bar-row static">
                <span className="an-bar-path">{path}</span>
                <span className="an-bar-track">
                  <span
                    className="an-bar-fill alt"
                    style={{ width: `${(count / maxPath) * 100}%` }}
                  />
                </span>
                <span className="an-bar-n">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
