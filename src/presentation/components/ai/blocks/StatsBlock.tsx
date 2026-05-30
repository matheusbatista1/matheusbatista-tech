"use client";

interface StatsBlockProps {
  items: Array<{ value: string; label: string }>;
}

export function StatsBlock({ items }: StatsBlockProps) {
  if (items.length === 0) return null;
  return (
    <div className="ai-stats">
      {items.map((it, i) => (
        <div className="ai-stat" key={`${it.label}-${i}`}>
          <span className="n">{it.value}</span>
          <span className="l">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
