"use client";

import { useTranslations } from "next-intl";
import type { Project } from "@/domain/entities/Project";
import { formatPillLabel } from "./pill";

interface ProjectSwitcherProps {
  projects: Project[];
  activeIndex: number;
  onSelect: (index: number) => void;
  reasons?: Record<string, string>;
}

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
              <span className="sw-text">
                <span className="sw-name">{p.name}</span>
                <span className="sw-pill">
                  {reasons[p.id] ?? (p.pill ? formatPillLabel(p.pill) : "PROJECT")}
                </span>
              </span>
              <span className="sw-bar" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
