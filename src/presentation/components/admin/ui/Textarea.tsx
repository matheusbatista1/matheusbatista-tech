"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, rows = 6, className, ...rest },
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx("admin-textarea", className)}
        {...rest}
      />
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
