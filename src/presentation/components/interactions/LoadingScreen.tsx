"use client";

import { useEffect, useRef, useState } from "react";

const LOAD_MS = 2500;
const FADE_MS = 700;

function MbPaths({ solid = false }: { solid?: boolean }) {
  const stroke = solid ? "#ffffff" : "rgba(255,255,255,0.28)";
  const sw = solid ? 8 : 1.6;
  return (
    <>
      <path
        d="M 60 220 L 60 80 Q 60 50 100 50 Q 140 50 140 80 L 140 220 M 140 80 Q 140 50 180 50 Q 220 50 220 80 L 220 220"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 320 220 L 320 30 M 320 130 Q 340 60 410 60 Q 480 60 480 145 Q 480 230 410 230 Q 340 230 320 165"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), LOAD_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!done) return;
    const el = rootRef.current;
    if (!el) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / FADE_MS);
      el.style.opacity = String(1 - k);
      if (k < 1) raf = requestAnimationFrame(tick);
      else setHidden(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  if (hidden) return null;

  return (
    <div className="loading-root" ref={rootRef} aria-hidden="true" role="presentation">
      <div className="loading-stage">
        <div className="loading-mb">
          <svg viewBox="0 0 540 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <clipPath id="mb-wipe">
                <rect className="mb-fill-rect" x="0" y="0" width="0" height="240" />
              </clipPath>
            </defs>
            <g className="mb-stroke">
              <MbPaths />
            </g>
            <g clipPath="url(#mb-wipe)" fill="#ffffff" stroke="none">
              <MbPaths solid />
            </g>
          </svg>
        </div>
        <div className="loading-bar" />
        <div className="loading-meta">
          <span className="nm">MATHEUS BATISTA</span>
          <span className="sep" />
          <span>SOFTWARE ENGINEER</span>
          <span className="sep" />
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}
