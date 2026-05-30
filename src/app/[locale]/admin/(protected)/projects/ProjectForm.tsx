"use client";

import { useActionState } from "react";
import type { Project } from "@/domain/entities/Project";
import { createProjectAction, updateProjectAction, type ProjectActionState } from "./actions";

interface ProjectFormProps {
  project?: Project;
}

const INITIAL_STATE: ProjectActionState = {};

const PILL_OPTIONS = [
  { value: "NONE", label: "— None —" },
  { value: "FLAGSHIP", label: "Flagship" },
  { value: "PRODUCTION", label: "Production" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "CASE_STUDY", label: "Case study" },
  { value: "AI", label: "AI" },
] as const;

export function ProjectForm({ project }: ProjectFormProps) {
  const isEdit = Boolean(project);
  const boundAction = isEdit ? updateProjectAction.bind(null, project!.id) : createProjectAction;

  const [state, formAction, pending] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-section">
        <h2>Basics</h2>
        <div className="admin-form-grid">
          <label>
            <span>Slug</span>
            <input
              name="slug"
              defaultValue={project?.slug ?? ""}
              required
              pattern="[a-z0-9-]+"
              placeholder="my-project"
            />
          </label>
          <label>
            <span>Name</span>
            <input name="name" defaultValue={project?.name ?? ""} required />
          </label>
          <label>
            <span>Display URL</span>
            <input name="url" defaultValue={project?.url ?? ""} placeholder="company.com/product" />
          </label>
          <label>
            <span>Live URL</span>
            <input
              name="liveUrl"
              type="url"
              defaultValue={project?.liveUrl ?? ""}
              placeholder="https://..."
            />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Description</h2>
        <p className="admin-form-hint">One short paragraph per locale.</p>
        <div className="admin-form-grid admin-form-grid-tall">
          <label>
            <span>EN</span>
            <textarea
              name="description.en"
              rows={5}
              defaultValue={project?.description.en ?? ""}
              required
            />
          </label>
          <label>
            <span>PT</span>
            <textarea
              name="description.pt"
              rows={5}
              defaultValue={project?.description.pt ?? ""}
              required
            />
          </label>
          <label>
            <span>ES</span>
            <textarea
              name="description.es"
              rows={5}
              defaultValue={project?.description.es ?? ""}
              required
            />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Meta</h2>
        <div className="admin-form-grid">
          <label>
            <span>Pill</span>
            <select name="pill" defaultValue={project?.pill ?? "NONE"}>
              {PILL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Tags (comma-separated)</span>
            <input
              name="tags"
              defaultValue={project?.tags.join(", ") ?? ""}
              placeholder=".NET, C#, REST APIs"
            />
          </label>
          <label>
            <span>Order</span>
            <input name="order" type="number" min={0} defaultValue={project?.order ?? 0} required />
          </label>
          <label className="admin-form-toggle">
            <input type="checkbox" name="deployed" defaultChecked={project?.deployed ?? false} />
            <span>Deployed (shows Open button)</span>
          </label>
          <label className="admin-form-toggle">
            <input type="checkbox" name="visible" defaultChecked={project?.visible ?? true} />
            <span>Visible on the portfolio</span>
          </label>
        </div>
        <p className="admin-form-hint">
          Image upload comes in a later PR (Vercel Blob). For now this saves with empty images.
        </p>
      </div>

      <div className="admin-form-foot">
        {state.error && <p className="admin-form-error">{state.error}</p>}
        {state.ok && <p className="admin-form-ok">Saved.</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </button>
      </div>
    </form>
  );
}
