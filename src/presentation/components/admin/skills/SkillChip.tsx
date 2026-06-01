"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import type { Skill } from "@/domain/entities/Skill";

interface SkillChipProps {
  skill: Skill;
  onOpen: () => void;
  onDelete: () => void;
}

export function SkillChip({ skill, onOpen, onDelete }: SkillChipProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onDelete();
  }

  const swatchBg = skill.color ?? "#3178c6";
  const swatchFg = skill.fg ?? "#fff";

  return (
    <div
      role="button"
      tabIndex={0}
      className="admin-skill-admin-chip"
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Edit ${skill.name}`}
    >
      <span className="sw" style={{ background: swatchBg, color: swatchFg }} aria-hidden="true">
        {skill.iconUrl ? (
          <img
            src={skill.iconUrl}
            alt=""
            className="sw-img"
            style={{
              transform: `translate(${skill.iconX ?? 0}px, ${skill.iconY ?? 0}px) scale(${skill.iconScale ?? 1})`,
            }}
          />
        ) : (
          skill.key.toUpperCase()
        )}
      </span>
      <span className="name">{skill.name}</span>
      <button
        type="button"
        className="x"
        onClick={handleDelete}
        aria-label={`Delete ${skill.name}`}
      >
        &times;
      </button>
    </div>
  );
}
