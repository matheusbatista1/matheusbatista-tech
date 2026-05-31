"use client";

import type { ReactNode } from "react";
import { ACountUp } from "./ACountUp";
import { Sparkline } from "./Sparkline";
import { computeDelta } from "./helpers";

interface AnCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  series: number[];
  sub?: string;
  accent?: string;
  loading?: boolean;
}

export function AnCard({ icon, label, value, series, sub, accent, loading }: AnCardProps) {
  if (loading) {
    return (
      <div className="an-card sk" aria-busy="true">
        <div className="an-card-top">
          <span className="an-sk-line w40" />
          <span className="an-sk-line w30" />
        </div>
        <span className="an-sk-line big w60" />
        {sub ? <span className="an-sk-line w30" /> : null}
        <div className="an-sk-spark" />
      </div>
    );
  }

  const delta = computeDelta(series);
  const up = delta >= 0;
  const arrow = up ? "▲" : "▼";
  const safeSeries = series && series.some((x) => x) ? series : [0, 0, 0, 0, 0, 0, 1];

  return (
    <div className="an-card">
      <div className="an-card-top">
        <span className="an-card-label">
          {icon}
          {label}
        </span>
        <span className={`an-delta${up ? "up" : "down"}`}>
          {arrow} {Math.abs(delta)}%
        </span>
      </div>
      <div className="an-card-val" style={accent ? { color: accent } : undefined}>
        <ACountUp to={value} />
      </div>
      {sub ? <div className="an-card-sub">{sub}</div> : null}
      <div className="an-card-spark" style={accent ? { color: accent } : undefined}>
        <Sparkline data={safeSeries} height={34} />
      </div>
    </div>
  );
}
