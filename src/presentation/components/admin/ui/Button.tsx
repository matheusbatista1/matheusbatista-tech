"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "default"
  | "ghost"
  | "danger"
  | "danger-solid"
  | "ai"
  | "icon";

export type ButtonSize = "sm" | "md";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "default",
    size = "md",
    icon,
    loading = false,
    disabled,
    type = "button",
    className,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        "admin-btn",
        `admin-btn-${variant}`,
        `admin-btn-${size}`,
        loading && "is-loading",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="admin-spin" aria-hidden="true" />
      ) : icon ? (
        <span className="admin-btn-icon-slot">{icon}</span>
      ) : null}
      {children != null && <span className="admin-btn-label">{children}</span>}
    </button>
  );
});
