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

  return (
    <div
      role="button"
      tabIndex={0}
      className="admin-skill-admin-chip"
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Edit ${skill.name}`}
    >
      <span
        className="sw"
        style={{ background: skill.color ?? "#3178c6", color: skill.fg ?? "#fff" }}
        aria-hidden="true"
      >
        {skill.key}
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
