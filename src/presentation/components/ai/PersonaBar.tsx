"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import { PERSONA_IDS } from "@/domain/entities/ai/Persona";
import { usePersona } from "@/presentation/providers/PersonaProvider";
import { AIMark } from "@/presentation/components/icons/Icons";

export function PersonaBar() {
  const t = useTranslations("persona");
  const { persona, applyPersona, busy } = usePersona();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: PersonaId) => {
    setOpen(false);
    void applyPersona(id);
  };

  return (
    <div ref={wrapperRef} className={["persona-bar", open ? "open" : ""].filter(Boolean).join(" ")}>
      <button type="button" className="persona-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="persona-eye">
          <AIMark size={15} />
        </span>
        <span>
          {t("viewingAs")} <b>{t(`${persona}.label`)}</b>
        </span>
        {busy && <span className="persona-spin" aria-hidden="true" />}
      </button>

      <div className="persona-menu" role="menu">
        {PERSONA_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="menuitemradio"
            aria-checked={persona === id}
            className={persona === id ? "on" : ""}
            onClick={() => choose(id)}
          >
            <span className="pm-label">{t(`${id}.label`)}</span>
            <span className="pm-hint">{t(`${id}.hint`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
