"use client";

import { useCallback } from "react";

const HEADER_OFFSET = 40;

export type SmoothScrollTarget = "top" | string;

export function useSmoothScrollTo(): (sectionId: SmoothScrollTarget) => void {
  return useCallback((sectionId: SmoothScrollTarget) => {
    if (typeof window === "undefined") return;
    if (sectionId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(sectionId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);
}
