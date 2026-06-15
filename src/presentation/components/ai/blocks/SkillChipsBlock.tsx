"use client";

import type { Skill } from "@/domain/entities/Skill";

interface SkillChipsBlockProps {
  names: string[];
  skills: Skill[];
}

const TOP_FALLBACK = 8;
const FALLBACK_COLOR = "#1f1f24";

interface ChipView {
  id: string;
  name: string;
  key: string;
  color: string | null;
  iconUrl: string | null;
  iconScale: number | null;
  iconX: number | null;
  iconY: number | null;
}

function makeKey(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function toChip(skill: Skill): ChipView {
  return {
    id: skill.id,
    name: skill.name,
    key: skill.key,
    color: skill.color,
    iconUrl: skill.iconUrl,
    iconScale: skill.iconScale,
    iconX: skill.iconX,
    iconY: skill.iconY,
  };
}

export function SkillChipsBlock({ names, skills }: SkillChipsBlockProps) {
  const picked: ChipView[] = names.length
    ? names.map((name) => {
        const match = skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
        return match
          ? toChip(match)
          : {
              id: name,
              name,
              key: makeKey(name),
              color: null,
              iconUrl: null,
              iconScale: null,
              iconX: null,
              iconY: null,
            };
      })
    : skills.slice(0, TOP_FALLBACK).map(toChip);

  return (
    <div className="ai-chips">
      {picked.map((s, i) => (
        <span className="ai-chip" key={`${s.name}-${i}`}>
          {s.iconUrl ? (
            <span className="d has-img" style={{ background: s.color || FALLBACK_COLOR }}>
              <img
                src={s.iconUrl}
                alt=""
                style={{
                  transform: `translate(${s.iconX ?? 0}px, ${s.iconY ?? 0}px) scale(${s.iconScale ?? 1})`,
                }}
              />
            </span>
          ) : (
            <span className="d" style={{ background: s.color || FALLBACK_COLOR }}>
              {s.key}
            </span>
          )}
          {s.name}
        </span>
      ))}
    </div>
  );
}
