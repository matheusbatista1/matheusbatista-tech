"use client";

import type { Skill } from "@/domain/entities/Skill";

interface SkillChipsBlockProps {
  names: string[];
  skills: Skill[];
}

const TOP_FALLBACK = 8;

function makeKey(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function SkillChipsBlock({ names, skills }: SkillChipsBlockProps) {
  const picked = names.length
    ? names.map((name) => {
        const match = skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
        return match ?? { name, key: makeKey(name), color: "#3b82f6", id: name };
      })
    : skills.slice(0, TOP_FALLBACK);

  return (
    <div className="ai-chips">
      {picked.map((s, i) => (
        <span className="ai-chip" key={`${s.name}-${i}`}>
          <span className="d" style={{ background: s.color ?? "#3b82f6" }}>
            {s.key}
          </span>
          {s.name}
        </span>
      ))}
    </div>
  );
}
