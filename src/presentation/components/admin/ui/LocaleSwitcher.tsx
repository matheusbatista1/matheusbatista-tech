"use client";

import type { Locale } from "@/domain/value-objects/Locale";
import { Tabs, type TabItem } from "./Tabs";

const LOCALE_TABS: ReadonlyArray<TabItem<Locale>> = [
  { value: "en", label: "EN" },
  { value: "pt", label: "PT" },
  { value: "es", label: "ES" },
];

export interface LocaleSwitcherProps {
  value: Locale;
  onValueChange: (locale: Locale) => void;
  className?: string;
  "aria-label"?: string;
}

export function LocaleSwitcher({
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel = "Locale",
}: LocaleSwitcherProps) {
  return (
    <Tabs<Locale>
      tabs={LOCALE_TABS}
      value={value}
      onValueChange={onValueChange}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
