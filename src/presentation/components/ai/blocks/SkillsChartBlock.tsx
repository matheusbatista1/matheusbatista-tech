"use client";

import { useEffect, useState } from "react";
import type { Skill } from "@/domain/entities/Skill";

interface SkillsChartBlockProps {
  groups: Array<{ label: string; value: number }>;
  skills: Skill[];
}

export function SkillsChartBlock({ groups, skills }: SkillsChartBlockProps) {
  const finalGroups = groups.length
    ? groups
    : Object.entries(
        skills.reduce<Record<string, number>>((acc, s) => {
          acc[s.category] = (acc[s.category] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([label, value]) => ({ label, value }));

  const max = Math.max(1, ...finalGroups.map((g) => g.value));
  const [grow, setGrow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="ai-chart">
      {finalGroups.map((g, i) => (
        <div className="ai-bar-row" key={`${g.label}-${i}`}>
          <span className="ai-bar-label">{g.label}</span>
          <div className="ai-bar-track">
            <div
              className="ai-bar-fill"
              style={{
                width: grow ? `${(g.value / max) * 100}%` : "0%",
                transitionDelay: `${i * 70}ms`,
              }}
            />
          </div>
          <span className="ai-bar-val">{g.value}</span>
        </div>
      ))}
    </div>
  );
}
