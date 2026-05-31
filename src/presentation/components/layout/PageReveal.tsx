"use client";

import type { ReactNode } from "react";
import { usePersona } from "@/presentation/providers/PersonaProvider";

export function PageReveal({ children }: { children: ReactNode }) {
  const { phase } = usePersona();
  const ready = phase === "ready";
  return (
    <div
      aria-hidden={!ready}
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity 320ms ease-out",
        pointerEvents: ready ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
