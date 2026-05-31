"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> {
  "aria-label": string;
  icon: ReactNode;
  tooltip?: string;
  size?: "sm" | "md";
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, tooltip, size = "md", loading = false, disabled, type = "button", className, ...rest },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      title={tooltip}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        "admin-btn",
        "admin-btn-icon",
        `admin-btn-${size}`,
        loading && "is-loading",
        className,
      )}
      {...rest}
    >
      {loading ? <span className="admin-spin" aria-hidden="true" /> : icon}
    </button>
  );
});
