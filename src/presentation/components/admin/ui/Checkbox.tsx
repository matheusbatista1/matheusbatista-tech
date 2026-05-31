"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;

  return (
    <label htmlFor={inputId} className={cx("admin-checkbox-wrap", className)}>
      <input ref={ref} id={inputId} type="checkbox" className="admin-checkbox" {...rest} />
      <span className="admin-checkbox-text">
        {label && <span className="admin-checkbox-label">{label}</span>}
        {description && <span className="admin-checkbox-desc">{description}</span>}
      </span>
    </label>
  );
});
