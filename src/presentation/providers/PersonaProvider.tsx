"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import { DEFAULT_PERSONA, isPersonaId } from "@/domain/entities/ai/Persona";

const STORAGE_KEY = "mb_persona_v1";

interface PersonaContextValue {
  persona: PersonaId;
  setPersona: (id: PersonaId) => void;
  hasChosen: boolean;
  markAsChosen: () => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaId>(DEFAULT_PERSONA);
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isPersonaId(stored)) {
        setPersonaState(stored);
        setHasChosen(true);
      }
    } catch {
      /* noop */
    }
  }, []);

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* noop */
    }
  }, []);

  const markAsChosen = useCallback(() => {
    setHasChosen(true);
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:chosen`, "1");
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo<PersonaContextValue>(
    () => ({ persona, setPersona, hasChosen, markAsChosen }),
    [persona, setPersona, hasChosen, markAsChosen],
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
