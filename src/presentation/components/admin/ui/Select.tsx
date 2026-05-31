"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, className, children, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const describedBy =
    [error ? `${inputId}-error` : null, hint && !error ? `${inputId}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cx("admin-field", error && "has-error")}>
      {label && (
        <label htmlFor={inputId} className="admin-field-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx("admin-select", className)}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="admin-field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="admin-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
