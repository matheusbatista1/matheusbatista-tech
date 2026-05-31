"use client";

import { useId } from "react";

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel,
}: ToggleProps) {
  const reactId = useId();
  const switchId = id ?? reactId;

  return (
    <label
      htmlFor={switchId}
      className={cx("admin-toggle-wrap", disabled && "is-disabled", className)}
    >
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cx("admin-toggle", checked && "is-on")}
      >
        <span className="admin-toggle-thumb" aria-hidden="true" />
      </button>
      {label && <span className="admin-toggle-label">{label}</span>}
    </label>
  );
}
