"use client";

import { useActionState } from "react";
import type { SocialLink } from "@/domain/entities/SocialLink";
import { createSocialAction, updateSocialAction, type SocialActionState } from "./actions";

interface SocialFormProps {
  social?: SocialLink;
}

const INITIAL_STATE: SocialActionState = {};

export function SocialForm({ social }: SocialFormProps) {
  const isEdit = Boolean(social);
  const boundAction = isEdit ? updateSocialAction.bind(null, social!.id) : createSocialAction;
  const [state, formAction, pending] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-section">
        <h2>Link</h2>
        <div className="admin-form-grid">
          <label>
            <span>Name</span>
            <input name="name" defaultValue={social?.name ?? ""} required placeholder="GitHub" />
          </label>
          <label>
            <span>URL</span>
            <input
              name="url"
              defaultValue={social?.url ?? ""}
              required
              placeholder="https://github.com/matheusbatista1"
            />
          </label>
          <label>
            <span>Handle (display)</span>
            <input
              name="handle"
              defaultValue={social?.handle ?? ""}
              placeholder="github.com/matheusbatista1"
            />
          </label>
          <label>
            <span>Order</span>
            <input name="order" type="number" min={0} defaultValue={social?.order ?? 0} required />
          </label>
          <label className="admin-form-toggle">
            <input type="checkbox" name="visible" defaultChecked={social?.visible ?? true} />
            <span>Visible on the portfolio</span>
          </label>
        </div>
      </div>

      <div className="admin-form-foot">
        {state.error && <p className="admin-form-error">{state.error}</p>}
        {state.ok && <p className="admin-form-ok">Saved.</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create link"}
        </button>
      </div>
    </form>
  );
}
