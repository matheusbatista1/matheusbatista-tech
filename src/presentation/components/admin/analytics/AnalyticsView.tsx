"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Activity, Eye, Server, User } from "lucide-react";

import { PageHead } from "@/presentation/components/admin/shell/PageHead";

import { AnCard } from "./AnCard";
import { Aggregates, type TopCountry, type TopPath } from "./Aggregates";
import { Toolbar, type AnKind } from "./Toolbar";
import { VisitsTable } from "./VisitsTable";
import { Pager } from "./Pager";
import type { AnVisit } from "./AnRow";

import "./analytics.css";

type AnRange = "today" | "7d" | "30d" | "all";

interface OverviewResponse {
  total: number;
  uniq: number;
  humans: number;
  bots: number;
  sTotal: number[];
  sUniq: number[];
  sHuman: number[];
  sBot: number[];
  topCountries: TopCountry[];
  topPaths: TopPath[];
}

interface VisitsResponse {
  entries: AnVisit[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export function AnalyticsView() {
  const t = useTranslations("admin.analytics");

  // Filter state
  const [range, setRange] = useState<AnRange>("7d");
  const [kind, setKind] = useState<AnKind>("all");
  const [country, setCountry] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [page, setPage] = useState<number>(0);

  // Data state
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [loadingVisits, setLoadingVisits] = useState<boolean>(true);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [visits, setVisits] = useState<VisitsResponse | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const overviewAbort = useRef<AbortController | null>(null);
  const visitsAbort = useRef<AbortController | null>(null);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(0);
  }, [kind, range, country, debouncedQuery]);

  // Fetch overview when range changes
  useEffect(() => {
    overviewAbort.current?.abort();
    const controller = new AbortController();
    overviewAbort.current = controller;
    setLoadingOverview(true);

    const params = new URLSearchParams({ range });
    fetch(`/api/admin/visits/overview?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("overview failed");
        return res.json();
      })
      .then((data: OverviewResponse) => {
        setOverview(data);
        setLoadingOverview(false);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setLoadingOverview(false);
      });

    return () => controller.abort();
  }, [range]);

  // Fetch visits when filters change
  useEffect(() => {
    visitsAbort.current?.abort();
    const controller = new AbortController();
    visitsAbort.current = controller;
    setLoadingVisits(true);

    const params = new URLSearchParams({
      range,
      kind,
      page: String(page),
      perPage: "50",
    });
    if (country !== "all") params.set("country", country);
    if (debouncedQuery) params.set("q", debouncedQuery);

    fetch(`/api/admin/visits?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("visits failed");
        return res.json();
      })
      .then((data: VisitsResponse) => {
        setVisits(data);
        setLoadingVisits(false);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setLoadingVisits(false);
      });

    return () => controller.abort();
  }, [range, kind, country, debouncedQuery, page]);

  const hasFilters = useMemo(
    () => kind !== "all" || country !== "all" || debouncedQuery.length > 0,
    [kind, country, debouncedQuery],
  );

  const onClearFilters = useCallback(() => {
    setKind("all");
    setCountry("all");
    setQuery("");
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const ranges: AnRange[] = ["today", "7d", "30d", "all"];

  const total = visits?.total ?? 0;
  const perPage = visits?.perPage ?? 50;
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="an-root">
      <PageHead
        title={t("title")}
        lead={t("lead")}
        actions={
          <>
            <div className="an-range" role="tablist">
              {ranges.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={range === r ? "true" : "false"}
                  className={`an-range-btn${range === r ? "on" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {t(`range.${r}`)}
                </button>
              ))}
            </div>
            <a
              className="admin-btn admin-btn-ghost admin-btn-sm"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="admin-btn-icon-slot">
                <Eye width={14} height={14} aria-hidden="true" />
              </span>
              <span className="admin-btn-label">{t("viewSite")}</span>
            </a>
          </>
        }
      />

      <div className="an-cards">
        <AnCard
          loading={loadingOverview}
          label={t("cards.total")}
          value={overview?.total ?? 0}
          series={overview?.sTotal ?? []}
          icon={<Activity aria-hidden="true" />}
        />
        <AnCard
          loading={loadingOverview}
          label={t("cards.uniq")}
          value={overview?.uniq ?? 0}
          series={overview?.sUniq ?? []}
          sub={t("cards.uniqSub")}
          icon={<Eye aria-hidden="true" />}
        />
        <AnCard
          loading={loadingOverview}
          label={t("cards.humans")}
          value={overview?.humans ?? 0}
          series={overview?.sHuman ?? []}
          accent="#22c55e"
          icon={<User aria-hidden="true" />}
        />
        <AnCard
          loading={loadingOverview}
          label={t("cards.bots")}
          value={overview?.bots ?? 0}
          series={overview?.sBot ?? []}
          accent="#f5b800"
          icon={<Server aria-hidden="true" />}
        />
      </div>

      <Aggregates
        topCountries={overview?.topCountries ?? []}
        topPaths={overview?.topPaths ?? []}
        country={country}
        setCountry={setCountry}
        loading={loadingOverview}
      />

      <Toolbar
        kind={kind}
        setKind={setKind}
        query={query}
        setQuery={setQuery}
        country={country}
        setCountry={setCountry}
      />

      <VisitsTable
        visits={visits?.entries ?? []}
        loading={loadingVisits}
        hasFilters={hasFilters}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        onClearFilters={onClearFilters}
      />

      {total > perPage ? (
        <Pager
          page={page}
          pageCount={pageCount}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        />
      ) : null}
    </div>
  );
}
