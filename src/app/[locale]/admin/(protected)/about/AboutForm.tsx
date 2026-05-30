"use client";

import { useActionState } from "react";
import type { AboutContent } from "@/domain/entities/AboutContent";
import { updateAboutAction, type AboutActionState } from "./actions";

interface AboutFormProps {
  about: AboutContent;
}

const INITIAL_STATE: AboutActionState = {};

export function AboutForm({ about }: AboutFormProps) {
  const [state, formAction, pending] = useActionState(updateAboutAction, INITIAL_STATE);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-section">
        <h2>Section label</h2>
        <div className="admin-form-grid">
          <label>
            <span>EN</span>
            <input name="label.en" defaultValue={about.label.en} required />
          </label>
          <label>
            <span>PT</span>
            <input name="label.pt" defaultValue={about.label.pt} required />
          </label>
          <label>
            <span>ES</span>
            <input name="label.es" defaultValue={about.label.es} required />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Body</h2>
        <p className="admin-form-hint">Main paragraph in the About section.</p>
        <div className="admin-form-grid admin-form-grid-tall">
          <label>
            <span>EN</span>
            <textarea name="body.en" rows={6} defaultValue={about.body.en} required />
          </label>
          <label>
            <span>PT</span>
            <textarea name="body.pt" rows={6} defaultValue={about.body.pt} required />
          </label>
          <label>
            <span>ES</span>
            <textarea name="body.es" rows={6} defaultValue={about.body.es} required />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Currently</h2>
        <p className="admin-form-hint">Highlighted line right below the main paragraph.</p>
        <div className="admin-form-grid">
          <label>
            <span>EN</span>
            <textarea name="currently.en" rows={3} defaultValue={about.currently.en} required />
          </label>
          <label>
            <span>PT</span>
            <textarea name="currently.pt" rows={3} defaultValue={about.currently.pt} required />
          </label>
          <label>
            <span>ES</span>
            <textarea name="currently.es" rows={3} defaultValue={about.currently.es} required />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Sidebar meta</h2>
        <div className="admin-form-grid">
          <label>
            <span>Role</span>
            <input name="role" defaultValue={about.role} required />
          </label>
          <label>
            <span>Location</span>
            <input name="location" defaultValue={about.location} required />
          </label>
          <label>
            <span>Years of experience</span>
            <input name="years" defaultValue={about.years} required />
          </label>
        </div>
      </div>

      <div className="admin-form-foot">
        {state.error && <p className="admin-form-error">{state.error}</p>}
        {state.ok && <p className="admin-form-ok">Saved.</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
