"use client";

import { useActionState } from "react";
import type { Skill } from "@/domain/entities/Skill";
import { createSkillAction, updateSkillAction, type SkillActionState } from "./actions";

interface SkillFormProps {
  skill?: Skill;
}

const INITIAL_STATE: SkillActionState = {};

const CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "devops", label: "DevOps" },
  { value: "tools", label: "Tools" },
] as const;

export function SkillForm({ skill }: SkillFormProps) {
  const isEdit = Boolean(skill);
  const boundAction = isEdit ? updateSkillAction.bind(null, skill!.id) : createSkillAction;
  const [state, formAction, pending] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-section">
        <h2>Skill</h2>
        <div className="admin-form-grid">
          <label>
            <span>Name</span>
            <input name="name" defaultValue={skill?.name ?? ""} required placeholder="TypeScript" />
          </label>
          <label>
            <span>Key (badge label)</span>
            <input
              name="key"
              defaultValue={skill?.key ?? ""}
              required
              maxLength={10}
              placeholder="TS"
            />
          </label>
          <label>
            <span>Category</span>
            <select name="category" defaultValue={skill?.category ?? "backend"}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Order in category</span>
            <input name="order" type="number" min={0} defaultValue={skill?.order ?? 0} required />
          </label>
          <label>
            <span>Badge color</span>
            <input
              name="color"
              type="color"
              defaultValue={skill?.color ?? "#3178c6"}
              className="admin-color-input"
            />
          </label>
        </div>
      </div>

      <div className="admin-form-foot">
        {state.error && <p className="admin-form-error">{state.error}</p>}
        {state.ok && <p className="admin-form-ok">Saved.</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create skill"}
        </button>
      </div>
    </form>
  );
}
