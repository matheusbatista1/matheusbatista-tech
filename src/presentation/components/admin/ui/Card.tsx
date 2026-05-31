import type { ReactNode } from "react";

export interface CardHeader {
  title: string;
  meta?: string;
  trailing?: ReactNode;
}

export interface CardProps {
  header?: CardHeader;
  padding?: "lg" | "md";
  className?: string;
  children: ReactNode;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

export function Card({ header, padding = "md", className, children }: CardProps) {
  return (
    <section className={cx("admin-card", `admin-card-pad-${padding}`, className)}>
      {header && (
        <header className="admin-card-head">
          <div className="admin-card-head-text">
            <h3 className="admin-card-title">{header.title}</h3>
            {header.meta && <p className="admin-card-meta">{header.meta}</p>}
          </div>
          {header.trailing && <div className="admin-card-trailing">{header.trailing}</div>}
        </header>
      )}
      <div className="admin-card-body">{children}</div>
    </section>
  );
}
