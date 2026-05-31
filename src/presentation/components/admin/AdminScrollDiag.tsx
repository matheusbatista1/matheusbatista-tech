"use client";
import { useEffect, useState } from "react";

import { getBodyLockCount } from "@/presentation/components/admin/ui/Modal";

export function AdminScrollDiag() {
  const [state, setState] = useState({
    overflow: "",
    lockCount: 0,
    hasScroll: false,
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tick = () => {
      const docEl = document.documentElement;
      setState({
        overflow: document.body.style.overflow || "(empty)",
        lockCount: getBodyLockCount(),
        hasScroll: docEl.scrollHeight > docEl.clientHeight,
        scrollTop: docEl.scrollTop,
        scrollHeight: docEl.scrollHeight,
        clientHeight: docEl.clientHeight,
      });
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  const onClick = () => {
    console.log("[AdminScrollDiag]", {
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
      computedBody: window.getComputedStyle(document.body).overflow,
      computedHtml: window.getComputedStyle(document.documentElement).overflow,
      lockCount: getBodyLockCount(),
      scrollTop: document.documentElement.scrollTop,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      window: { innerHeight: window.innerHeight, innerWidth: window.innerWidth },
    });
    console.log("Forcing unlockBody if needed...");
    const w = window as unknown as { __admin?: { unlockBody: () => void } };
    w.__admin?.unlockBody?.();
  };

  const isProblem = state.overflow === "hidden" && state.lockCount === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 9999,
        padding: "8px 10px",
        borderRadius: 8,
        background: isProblem ? "rgba(239,68,68,0.95)" : "rgba(20,20,26,0.92)",
        color: "#fff",
        fontFamily: "ui-monospace,monospace",
        fontSize: 11,
        lineHeight: 1.5,
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        cursor: "pointer",
        textAlign: "left",
      }}
      title="Click pra logar dump + reset body lock"
    >
      <div>overflow: {state.overflow}</div>
      <div>lockCount: {state.lockCount}</div>
      <div>
        scroll: {state.scrollTop}/{state.scrollHeight} (view {state.clientHeight})
      </div>
      <div>hasScroll: {String(state.hasScroll)}</div>
    </button>
  );
}
