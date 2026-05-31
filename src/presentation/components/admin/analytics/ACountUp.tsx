"use client";

import { useEffect, useState } from "react";

interface ACountUpProps {
  to: number;
  duration?: number;
}

export function ACountUp({ to, duration = 700 }: ACountUpProps) {
  const [display, setDisplay] = useState<number>(0);

  useEffect(() => {
    if (to === 0) {
      setDisplay(0);
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        setDisplay(to);
        return;
      }
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(eased * to);
      if (k < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };
    raf = requestAnimationFrame(tick);

    const fallback = window.setTimeout(() => setDisplay(to), duration + 800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [to, duration]);

  return <>{Math.round(display).toLocaleString()}</>;
}
