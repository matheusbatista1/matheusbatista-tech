"use client";

interface TimelineBlockProps {
  items: Array<{ role: string; company: string; period: string; note?: string }>;
}

export function TimelineBlock({ items }: TimelineBlockProps) {
  if (items.length === 0) return null;
  return (
    <div className="ai-timeline">
      {items.map((it, i) => (
        <div className="ai-tl-item" key={`${it.role}-${i}`}>
          <span className="ai-tl-dot" />
          <div>
            <div className="ai-tl-role">
              {it.role}
              {it.company && ` · ${it.company}`}
            </div>
            {it.period && <div className="ai-tl-period">{it.period}</div>}
            {it.note && <div className="ai-tl-note">{it.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
