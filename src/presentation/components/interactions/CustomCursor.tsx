"use client";

import { useEffect, useRef } from "react";

const HALO_EASING = 0.18;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const dot = dotRef.current;
    const halo = haloRef.current;
    if (!dot || !halo) return;

    document.body.classList.add("custom-cursor-active");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let hx = tx;
    let hy = ty;
    let raf = 0;

    const tick = () => {
      hx += (tx - hx) * HALO_EASING;
      hy += (ty - hy) * HALO_EASING;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      halo.style.transform = `translate(${hx}px, ${hy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const link = target.closest("a, button, [data-cursor='link']");
      const text = target.closest("input, textarea, [data-cursor='text']");
      if (link) {
        halo.classList.add("on-link");
        halo.classList.remove("on-text");
      } else if (text) {
        halo.classList.add("on-text");
        halo.classList.remove("on-link");
      } else {
        halo.classList.remove("on-link", "on-text");
      }
    };

    const setVisible = (visible: boolean) => {
      const opacity = visible ? "1" : "0";
      halo.style.opacity = opacity;
      dot.style.opacity = opacity;
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) onLeave();
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onPointerOut);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <div className="cursor-halo" ref={haloRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
