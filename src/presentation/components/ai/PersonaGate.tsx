"use client";

import { useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import { PERSONA_IDS } from "@/domain/entities/ai/Persona";
import { usePersona } from "@/presentation/providers/PersonaProvider";
import { AIMark, ArrowUpRightIcon } from "@/presentation/components/icons/Icons";

const SELECTABLE_PERSONAS: PersonaId[] = PERSONA_IDS.filter((id) => id !== "default");

export function PersonaGate() {
  const t = useTranslations("persona");
  const { phase, applyPersona, skipGate } = usePersona();
  const [picked, setPicked] = useState<PersonaId | null>(null);

  if (phase !== "gate") return null;

  const choose = (id: PersonaId) => {
    setPicked(id);
    window.setTimeout(() => {
      void applyPersona(id);
    }, 260);
  };

  const onCardMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  };

  return (
    <div className={["persona-gate", picked ? "leaving" : ""].filter(Boolean).join(" ")}>
      <div className="pg-ambient" aria-hidden="true" />
      <div className="pg-inner">
        <div className="pg-mark">
          <AIMark size={30} />
        </div>
        <h2 className="pg-title">{t("gateTitle")}</h2>
        <p className="pg-sub">{t("gateSub")}</p>

        <div className="pg-grid">
          {SELECTABLE_PERSONAS.map((id) => (
            <button
              key={id}
              type="button"
              className={["pg-card", picked === id ? "picked" : ""].filter(Boolean).join(" ")}
              onPointerMove={onCardMove}
              onClick={() => choose(id)}
            >
              <span className="pg-card-glyph">
                <AIMark size={20} />
              </span>
              <span className="pg-card-label">{t(`${id}.label`)}</span>
              <span className="pg-card-hint">{t(`${id}.hint`)}</span>
              <span className="pg-card-arrow">
                <ArrowUpRightIcon />
              </span>
            </button>
          ))}
        </div>

        <button type="button" className="pg-skip" onClick={skipGate}>
          {t("skip")}
        </button>
      </div>
    </div>
  );
}
