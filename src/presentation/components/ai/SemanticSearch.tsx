"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/domain/value-objects/Locale";
import { AIMark, CloseIcon, SearchIcon } from "@/presentation/components/icons/Icons";
import type { RankedProject } from "@/presentation/components/sections/Projects";

interface SemanticSearchProps {
  onResults: (ranked: RankedProject[] | null) => void;
}

export function SemanticSearch({ onResults }: SemanticSearchProps) {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(false);

  const reset = () => {
    setQuery("");
    setActive(false);
    onResults(null);
  };

  const run = async () => {
    const trimmed = query.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, locale }),
      });
      if (!res.ok) {
        onResults([]);
        setActive(true);
        return;
      }
      const data = (await res.json()) as { ranked: RankedProject[] };
      onResults(data.ranked);
      setActive(true);
    } catch {
      onResults([]);
      setActive(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={["sem-search", active ? "active" : ""].filter(Boolean).join(" ")}>
      <span className="sem-ico" aria-hidden="true">
        {busy ? <span className="sem-spin" /> : <SearchIcon />}
      </span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void run();
          }
          if (e.key === "Escape") reset();
        }}
        placeholder={t("searchPh")}
        aria-label={t("search")}
        disabled={busy}
      />
      {query && (
        <button type="button" className="sem-clear" onClick={reset} aria-label={t("reset")}>
          <CloseIcon />
        </button>
      )}
      <button
        type="button"
        className="sem-go"
        onClick={() => void run()}
        disabled={busy || !query.trim()}
      >
        <span className="sem-spark" aria-hidden="true">
          <AIMark size={13} />
        </span>
        {t("search")}
      </button>
    </div>
  );
}
