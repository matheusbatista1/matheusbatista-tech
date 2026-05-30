"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  to: number;
  duration?: number;
  threshold?: number;
}

export function useCountUp({ to, duration = 1400, threshold = 0.2 }: UseCountUpOptions) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const t0 = performance.now();
      let raf = 0;
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 3);
        setValue(Math.round(eased * to));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          start();
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);

    const safety = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) start();
    }, 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [to, duration, threshold]);

  return { ref, value };
}
