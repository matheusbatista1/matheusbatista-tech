"use client";

import { useEffect, useRef } from "react";

interface UseTiltOptions {
  range?: number;
  easing?: number;
}

const DEFAULTS: Required<UseTiltOptions> = {
  range: 4,
  easing: 0.1,
};

export function useTilt<T extends HTMLElement>({ range, easing }: UseTiltOptions = {}) {
  const ref = useRef<T>(null);
  const opts = { ...DEFAULTS, range: range ?? DEFAULTS.range, easing: easing ?? DEFAULTS.easing };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    const tick = () => {
      x += (tx - x) * opts.easing;
      y += (ty - y) * opts.easing;
      el.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      tx = (e.clientX / w - 0.5) * (opts.range * 2);
      ty = -(e.clientY / h - 0.5) * (opts.range * 2 * 0.75);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [opts.easing, opts.range]);

  return ref;
}
