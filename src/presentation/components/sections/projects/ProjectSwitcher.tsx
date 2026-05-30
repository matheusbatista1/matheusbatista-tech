"use client";

import { useTranslations } from "next-intl";
import type { Project, ProjectPill } from "@/domain/entities/Project";

interface ProjectSwitcherProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (index: number) => void;
  reasons?: Record<string, string>;
}

const PILL_LABELS: Record<ProjectPill, string> = {
  FLAGSHIP: "FLAGSHIP",
  PRODUCTION: "PRODUCTION",
  INTEGRATION: "INTEGRATION",
  CASE_STUDY: "CASE STUDY",
  AI: "AI",
};

export function ProjectSwitcher({
  projects,
  activeIndex,
  onSelect,
  reasons = {},
}: ProjectSwitcherProps) {
  const t = useTranslations("projects");

  return (
    <div className="showcase-switcher">
      <div className="sw-hint">
        <span>{t("navHint")}</span>
      </div>
      <ul className="sw-list">
        {projects.map((p, i) => (
          <li key={p.id} className={i === activeIndex ? "on" : ""}>
            <button type="button" onClick={() => onSelect(i)} aria-current={i === activeIndex}>
              <span className="sw-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="sw-name">{p.name}</span>
              <span className="sw-pill">
                {reasons[p.id] ?? (p.pill ? PILL_LABELS[p.pill] : "PROJECT")}
              </span>
              <span className="sw-bar" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
