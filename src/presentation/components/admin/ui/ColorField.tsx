"use client";

import { useId, type ChangeEvent } from "react";

export interface ColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  previewKey?: string;
  disabled?: boolean;
  className?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

const HEX_RE = /^#?[0-9a-fA-F]{0,6}$/;

function normalize(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function ColorField({
  value,
  onChange,
  label,
  previewKey,
  disabled = false,
  className,
}: ColorFieldProps) {
  const reactId = useId();
  const colorId = `${reactId}-color`;
  const hexId = `${reactId}-hex`;

  const safeColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : "#000000";

  const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (!HEX_RE.test(raw)) return;
    onChange(normalize(raw));
  };

  return (
    <div className={cx("admin-color-field", className)}>
      {label && (
        <label htmlFor={hexId} className="admin-field-label">
          {label}
        </label>
      )}
      <div className="admin-color-row">
        <span className="admin-color-preview" style={{ background: safeColor }} aria-hidden="true">
          {previewKey && <span className="admin-color-key">{previewKey.toUpperCase()}</span>}
        </span>
        <input
          id={colorId}
          type="color"
          value={safeColor}
          onChange={onColorChange}
          disabled={disabled}
          aria-label={label ? `${label} swatch` : "Color swatch"}
          className="admin-color-swatch"
        />
        <input
          id={hexId}
          type="text"
          value={value}
          onChange={onTextChange}
          disabled={disabled}
          inputMode="text"
          spellCheck={false}
          placeholder="#000000"
          maxLength={7}
          className="admin-input admin-color-hex"
        />
      </div>
    </div>
  );
}
