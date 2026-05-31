import type { ReactNode } from "react";

interface AnKVProps {
  label: ReactNode;
  value: ReactNode;
  mono?: boolean;
  warn?: boolean;
}

export function AnKV({ label, value, mono, warn }: AnKVProps) {
  const cls = ["an-kv-v", mono ? "mono" : null, warn ? "warn" : null].filter(Boolean).join(" ");
  return (
    <div className="an-kv">
      <span className="an-kv-k">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}
