"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/domain/repositories/IContentRepository";
import { updateSettingsAction, type SettingsActionState } from "./actions";

interface SettingsFormProps {
  settings: SiteSettings;
}

const INITIAL_STATE: SettingsActionState = {};

const LOCALES = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "es", label: "Español" },
] as const;

const THEMES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
] as const;

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, INITIAL_STATE);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-section">
        <h2>Defaults</h2>
        <p className="admin-form-hint">
          Used when a visitor lands without locale or theme preferences set.
        </p>
        <div className="admin-form-grid">
          <label>
            <span>Default language</span>
            <select name="defaultLang" defaultValue={settings.defaultLang || "en"}>
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Default theme</span>
            <select name="defaultTheme" defaultValue={settings.defaultTheme || "dark"}>
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="admin-form-foot">
        {state.error && <p className="admin-form-error">{state.error}</p>}
        {state.ok && <p className="admin-form-ok">Saved.</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
