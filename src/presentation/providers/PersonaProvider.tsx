"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";
import type { PersonaId } from "@/domain/entities/ai/Persona";
import { DEFAULT_PERSONA, isPersonaId } from "@/domain/entities/ai/Persona";
import type { PersonaCopyOverride } from "@/domain/entities/ai/PromptContext";
import type { Locale } from "@/domain/value-objects/Locale";

const PERSONA_KEY = "mb_persona_v1";
const SESSION_LOCALE_KEY = "mb_session_locale_v1";
const MIN_LOADER_MS_DEFAULT = 1100;
const MIN_LOADER_MS_OTHER = 1600;
const SPLASH_MIN_MS = 2500;

export type PersonaPhase = "splash" | "gate" | "personaLoading" | "ready";

interface PersonaContextValue {
  persona: PersonaId;
  setPersona: (id: PersonaId) => void;
  phase: PersonaPhase;
  pendingPersona: PersonaId;
  copy: PersonaCopyOverride | null;
  busy: boolean;
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
  const [phase, setPhase] = useState<PersonaPhase>("splash");
  const [pendingPersona, setPendingPersona] = useState<PersonaId>(DEFAULT_PERSONA);
  const [copy, setCopy] = useState<PersonaCopyOverride | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingLocaleSwitchPersona, setPendingLocaleSwitchPersona] = useState<PersonaId | null>(
    null,
  );

  // Tracks whether the splash → gate scheduler has already executed once.
  // Prevents the splash timer from ever being re-scheduled after the user has
  // moved past "splash" (e.g. on locale change or any subsequent re-render),
  // which previously caused the gate to reopen ~2.5s after a language switch.
  const didInitRef = useRef(false);

  // Mount-only bootstrap: read stored persona, decide whether we're on a
  // language switch (skip splash) or a real first visit / F5 (run splash).
  // This effect intentionally runs ONCE per provider lifetime — locale changes
  // are handled by the separate effect below so the gate cannot be re-entered.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    let storedPersona: string | null = null;
    try {
      storedPersona = window.localStorage.getItem(PERSONA_KEY);
    } catch {
      /* noop */
    }
    if (storedPersona && isPersonaId(storedPersona)) setPersonaState(storedPersona);

    let storedLocale: string | null = null;
    try {
      storedLocale = window.sessionStorage.getItem(SESSION_LOCALE_KEY);
    } catch {
      /* noop */
    }

    const isLanguageSwitch = storedLocale !== null && storedLocale !== locale;

    if (isLanguageSwitch) {
      // Skip splash + gate entirely on language switch within the same session.
      try {
        window.sessionStorage.setItem(SESSION_LOCALE_KEY, locale);
      } catch {
        /* noop */
      }
      if (storedPersona && isPersonaId(storedPersona) && storedPersona !== "default") {
        setPendingLocaleSwitchPersona(storedPersona);
      } else {
        setPhase("ready");
      }
      return;
    }

    // First visit or F5 in the same locale → run the splash → gate flow.
    const timer = window.setTimeout(() => {
      if (aiEnabled) {
        setPhase("gate");
      } else {
        setPhase("ready");
      }
    }, SPLASH_MIN_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setPhase("ready");
  }, []);

  // Language-switch detector: when the locale changes after the initial mount,
  // queue a persona re-application (which re-fetches translated copy). This
  // is the single source of truth for locale changes — there is no second
  // `[locale]`-only effect calling applyPersona to race with this one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!didInitRef.current) return;

    let storedLocale: string | null = null;
    try {
      storedLocale = window.sessionStorage.getItem(SESSION_LOCALE_KEY);
    } catch {
      /* noop */
    }

    if (storedLocale === locale) return;

    try {
      window.sessionStorage.setItem(SESSION_LOCALE_KEY, locale);
    } catch {
      /* noop */
    }

    if (persona !== "default") {
      setPendingLocaleSwitchPersona(persona);
    }
    // We only react to locale flips here. persona is read for the current
    // committed value but should not retrigger this effect on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    if (!pendingLocaleSwitchPersona) return;
    const target = pendingLocaleSwitchPersona;
    setPendingLocaleSwitchPersona(null);
    void applyPersona(target);
  }, [pendingLocaleSwitchPersona, applyPersona]);

  // Keep sessionStorage in sync once the user reaches "ready" (covers the
  // first-visit flow where the mount effect did not write it).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase !== "ready") return;
    try {
      window.sessionStorage.setItem(SESSION_LOCALE_KEY, locale);
    } catch {
      /* noop */
    }
  }, [phase, locale]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.gate = phase === "ready" ? "" : "locked";
    return () => {
      document.body.dataset.gate = "";
    };
  }, [phase]);

  const value = useMemo<PersonaContextValue>(
    () => ({
      persona,
      setPersona,
      phase,
      pendingPersona,
      copy,
      busy,
      applyPersona,
      skipGate,
    }),
    [persona, setPersona, phase, pendingPersona, copy, busy, applyPersona, skipGate],
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
