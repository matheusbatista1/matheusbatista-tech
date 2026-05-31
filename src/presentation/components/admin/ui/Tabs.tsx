"use client";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
}

export interface TabsProps<T extends string = string> {
  tabs: ReadonlyArray<TabItem<T>>;
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export function Tabs<T extends string = string>({
  tabs,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: TabsProps<T>) {
  return (
    <div className={cx("admin-tabs", className)} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(tab.value)}
            className={cx("admin-tabs-item", isActive && "is-active")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
