"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import type { Skill, SkillCategory } from "@/domain/entities/Skill";

interface SkillsProps {
  skills: Skill[];
}

type FilterKey = "all" | SkillCategory;

const CATEGORY_ORDER: readonly FilterKey[] = [
  "all",
  "frontend",
  "backend",
  "database",
  "devops",
  "tools",
];

function SkillCard({ skill }: { skill: Skill }) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="skill-card" ref={ref} onPointerMove={onPointerMove}>
      <span className="sw" style={{ background: skill.color ?? "#1f1f24" }}>
        {skill.key}
      </span>
      <div className="info">
        <div className="nm">{skill.name}</div>
        <div className="cat">{skill.category}</div>
      </div>
    </div>
  );
}

export function Skills({ skills }: SkillsProps) {
  const t = useTranslations("skills");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(
    () => (filter === "all" ? skills : skills.filter((s) => s.category === filter)),
    [filter, skills],
  );

  const counts = useMemo(() => {
    const map = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<FilterKey, number>;
    map.all = skills.length;
    for (const s of skills) {
      map[s.category] = (map[s.category] ?? 0) + 1;
    }
    return map;
  }, [skills]);

  const marqueeItems = useMemo(() => skills.slice(0, 14), [skills]);

  return (
    <section className="section reveal" id="skills">
      <div className="shell">
        <div className="section-head">
          <span className="section-num">03 /</span>
          <span className="section-label">{t("label")}</span>
          <span className="proj-counter">
            <span className="cur">{String(filtered.length).padStart(2, "0")}</span>
            <span className="sep">/</span>
            <span>{String(skills.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>

      <div className="skills-marquee" aria-hidden="true">
        <div className="track">
          {[...marqueeItems, ...marqueeItems].map((s, i) => (
            <div className="item" key={`${s.key}-${i}`}>
              <span>{s.name}</span>
              <span className="sep" />
            </div>
          ))}
        </div>
      </div>

      <div className="shell">
        <div className="skill-filters" role="tablist">
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filter === cat}
              className={["skill-filter", filter === cat ? "on" : ""].filter(Boolean).join(" ")}
              onClick={() => setFilter(cat)}
            >
              {t(cat)}
              <span className="count">{counts[cat]}</span>
            </button>
          ))}
        </div>

        <div className="skill-cloud">
          {filtered.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
