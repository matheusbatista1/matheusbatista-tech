"use client";

import { useEffect, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}

function defaultFormat(n: number): string {
  return Math.round(n).toLocaleString();
}

export function CountUp({ value, duration = 700, format = defaultFormat }: CountUpProps) {
  const [display, setDisplay] = useState<number>(value === 0 ? 0 : 0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        setDisplay(value);
        return;
      }
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(eased * value);
      if (k < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };
    raf = requestAnimationFrame(tick);

    const hardFallback = window.setTimeout(() => setDisplay(value), duration + 800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hardFallback);
    };
  }, [value, duration]);

  return <span className="count-up">{format(display)}</span>;
}
