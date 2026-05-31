"use client";

import { useEffect } from "react";

export function AdminGlow() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const root = document.documentElement;

    const handleMove = (event: MouseEvent) => {
      root.style.setProperty("--glow-x", `${event.clientX}px`);
      root.style.setProperty("--glow-y", `${event.clientY}px`);
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return <div className="admin-glow" aria-hidden="true" />;
}
