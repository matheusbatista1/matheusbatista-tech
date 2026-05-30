"use client";

import { useTranslations } from "next-intl";
import { useCountUp } from "@/presentation/hooks/useCountUp";

interface AboutStatsProps {
  projectsCount: number;
  companiesCount: number;
  technologiesCount: number;
}

function StatCell({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const { ref, value: animated } = useCountUp({ to: value });
  return (
    <div className="stat-cell">
      <span className="num">
        <span ref={ref}>
          {animated.toLocaleString()}
          {suffix}
        </span>
      </span>
      <span className="lab">{label}</span>
    </div>
  );
}

export function AboutStats({ projectsCount, companiesCount, technologiesCount }: AboutStatsProps) {
  const t = useTranslations("about");

  return (
    <div className="stat-row">
      <StatCell value={projectsCount} label={t("shipped")} />
      <StatCell value={companiesCount} label={t("companies")} />
      <StatCell value={technologiesCount} label={t("technologies")} suffix="+" />
    </div>
  );
}
