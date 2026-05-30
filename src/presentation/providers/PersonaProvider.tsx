"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import { DEFAULT_PERSONA, isPersonaId } from "@/domain/entities/ai/Persona";
import type { PersonaCopyOverride } from "@/domain/entities/ai/PromptContext";
import type { Locale } from "@/domain/value-objects/Locale";

const PERSONA_KEY = "mb_persona_v1";
const CHOSEN_KEY = "mb_persona_chosen_v1";
const MIN_LOADER_MS_DEFAULT = 1100;
const MIN_LOADER_MS_OTHER = 1600;

export type PersonaPhase = "ready" | "gate" | "personaLoading";

interface PersonaContextValue {
  persona: PersonaId;
  setPersona: (id: PersonaId) => void;
  phase: PersonaPhase;
  pendingPersona: PersonaId;
  copy: PersonaCopyOverride | null;
  busy: boolean;
  hasChosen: boolean;
  applyPersona: (id: PersonaId) => Promise<void>;
  skipGate: () => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

interface PersonaProviderProps {
  aiEnabled: boolean;
  children: React.ReactNode;
}

export function PersonaProvider({ aiEnabled, children }: PersonaProviderProps) {
  const locale = useLocale() as Locale;
  const [persona, setPersonaState] = useState<PersonaId>(DEFAULT_PERSONA);
  const [phase, setPhase] = useState<PersonaPhase>("ready");
  const [pendingPersona, setPendingPersona] = useState<PersonaId>(DEFAULT_PERSONA);
  const [copy, setCopy] = useState<PersonaCopyOverride | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasChosen, setHasChosen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: string | null = null;
    let chosen: string | null = null;
    try {
      stored = window.localStorage.getItem(PERSONA_KEY);
      chosen = window.localStorage.getItem(CHOSEN_KEY);
    } catch {
      /* noop */
    }
    if (stored && isPersonaId(stored)) {
      setPersonaState(stored);
    }
    const userHasChosen = chosen === "1";
    setHasChosen(userHasChosen);
    if (aiEnabled && !userHasChosen) {
      setPhase("gate");
    }
  }, [aiEnabled]);

  const fetchCopy = useCallback(
    async (id: PersonaId, requestLocale: Locale): Promise<PersonaCopyOverride | null> => {
      if (id === "default") return null;
      const res = await fetch("/api/ai/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: id, locale: requestLocale }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { copy: PersonaCopyOverride | null };
      return data.copy;
    },
    [],
  );

  const applyPersona = useCallback(
    async (id: PersonaId) => {
      setPendingPersona(id);
      setPhase("personaLoading");
      setBusy(true);
      const started = performance.now();
      const minMs = id === "default" ? MIN_LOADER_MS_DEFAULT : MIN_LOADER_MS_OTHER;

      let result: PersonaCopyOverride | null = null;
      try {
        result = await fetchCopy(id, locale);
      } catch {
        result = null;
      }

      const elapsed = performance.now() - started;
      const wait = Math.max(0, minMs - elapsed);

      window.setTimeout(() => {
        setPersonaState(id);
        setCopy(result);
        setBusy(false);
        setPhase("ready");
        try {
          window.localStorage.setItem(PERSONA_KEY, id);
        } catch {
          /* noop */
        }
      }, wait);
    },
    [fetchCopy, locale],
  );

  const setPersona = useCallback(
    (id: PersonaId) => {
      void applyPersona(id);
    },
    [applyPersona],
  );

  const skipGate = useCallback(() => {
    setHasChosen(true);
    setPhase("ready");
    try {
      window.localStorage.setItem(CHOSEN_KEY, "1");
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (phase === "ready" && hasChosen) {
      try {
        window.localStorage.setItem(CHOSEN_KEY, "1");
      } catch {
        /* noop */
      }
    }
  }, [phase, hasChosen]);

  useEffect(() => {
    if (persona === "default" || phase !== "ready") return;
    void applyPersona(persona);
    // re-run when locale changes; applyPersona is stable enough for this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const value = useMemo<PersonaContextValue>(
    () => ({
      persona,
      setPersona,
      phase,
      pendingPersona,
      copy,
      busy,
      hasChosen,
      applyPersona,
      skipGate,
    }),
    [persona, setPersona, phase, pendingPersona, copy, busy, hasChosen, applyPersona, skipGate],
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona must be used within PersonaProvider");
  }
  return ctx;
}
