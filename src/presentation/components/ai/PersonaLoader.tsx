"use client";

import { useTranslations } from "next-intl";
import { usePersona } from "@/presentation/providers/PersonaProvider";
import { AIMark } from "@/presentation/components/icons/Icons";

export function PersonaLoader() {
  const t = useTranslations("persona");
  const { phase, pendingPersona } = usePersona();

  if (phase !== "personaLoading") return null;

  return (
    <div className="persona-loader" role="status" aria-live="polite">
      <div className="pl-field" aria-hidden="true">
        <span className="pl-orb pl-orb-1" />
        <span className="pl-orb pl-orb-2" />
        <span className="pl-orb pl-orb-3" />
      </div>
      <div className="pl-center">
        <div className="pl-mark">
          <AIMark size={34} animated />
        </div>
        <div className="pl-label">{t("apply")}</div>
        <div className="pl-persona">{t(`${pendingPersona}.label`)}</div>
        <div className="pl-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
