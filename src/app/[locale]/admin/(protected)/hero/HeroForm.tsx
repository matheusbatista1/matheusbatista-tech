"use client";

import { useActionState } from "react";
import type { HeroContent } from "@/domain/entities/HeroContent";
import { updateHeroAction, type HeroActionState } from "./actions";

interface HeroFormProps {
  hero: HeroContent;
}

const INITIAL_STATE: HeroActionState = {};

export function HeroForm({ hero }: HeroFormProps) {
  const [state, formAction, pending] = useActionState(updateHeroAction, INITIAL_STATE);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-section">
        <h2>Greeting</h2>
        <div className="admin-form-grid">
          <label>
            <span>Hello word</span>
            <input name="greetHello" defaultValue={hero.greetHello} required />
          </label>
          <label>
            <span>I&apos;m word</span>
            <input name="greetIm" defaultValue={hero.greetIm} required />
          </label>
          <label>
            <span>First name</span>
            <input name="firstName" defaultValue={hero.firstName} required />
          </label>
          <label>
            <span>Last name</span>
            <input name="lastName" defaultValue={hero.lastName} required />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Subtitle</h2>
        <p className="admin-form-hint">One short sentence below the name, in all three locales.</p>
        <div className="admin-form-grid">
          <label>
            <span>EN</span>
            <input name="subtitle.en" defaultValue={hero.subtitle.en} required />
          </label>
          <label>
            <span>PT</span>
            <input name="subtitle.pt" defaultValue={hero.subtitle.pt} required />
          </label>
          <label>
            <span>ES</span>
            <input name="subtitle.es" defaultValue={hero.subtitle.es} required />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Tagline</h2>
        <p className="admin-form-hint">Editorial sub-line under the lead.</p>
        <div className="admin-form-grid">
          <label>
            <span>EN</span>
            <textarea name="tagline.en" rows={2} defaultValue={hero.tagline.en} required />
          </label>
          <label>
            <span>PT</span>
            <textarea name="tagline.pt" rows={2} defaultValue={hero.tagline.pt} required />
          </label>
          <label>
            <span>ES</span>
            <textarea name="tagline.es" rows={2} defaultValue={hero.tagline.es} required />
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Availability</h2>
        <div className="admin-form-grid">
          <label>
            <span>Pre</span>
            <input name="availabilityPre" defaultValue={hero.availabilityPre} required />
          </label>
          <label>
            <span>Word A</span>
            <input name="availabilityA" defaultValue={hero.availabilityA} required />
          </label>
          <label>
            <span>Word B</span>
            <input name="availabilityB" defaultValue={hero.availabilityB} required />
          </label>
          <label className="admin-form-toggle">
            <input type="checkbox" name="available" defaultChecked={hero.available} />
            <span>Show availability badge</span>
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
