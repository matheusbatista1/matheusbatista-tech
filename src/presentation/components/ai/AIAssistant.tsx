"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AIBlock, ChatResponse } from "@/domain/entities/ai/AIBlock";
import type { Project } from "@/domain/entities/Project";
import type { Skill } from "@/domain/entities/Skill";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { Locale } from "@/domain/value-objects/Locale";
import { usePersona } from "@/presentation/providers/PersonaProvider";
import { AIMark, ArrowUpRightIcon, CloseIcon } from "@/presentation/components/icons/Icons";
import { AIBlockRenderer } from "./AIBlockRenderer";

interface AIAssistantProps {
  projects: Project[];
  skills: Skill[];
  socials: SocialLink[];
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  blocks: AIBlock[];
  suggestions?: string[];
}

export function AIAssistant({ projects, skills, socials }: AIAssistantProps) {
  const t = useTranslations("ai");
  const locale = useLocale() as Locale;
  const { persona } = usePersona();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [t("suggestion1"), t("suggestion2"), t("suggestion3"), t("suggestion4")];

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread, busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleOpenProject = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent("open-project", { detail: id }));
    setOpen(false);
  }, []);

  const ask = useCallback(
    async (question?: string) => {
      const text = (question ?? query).trim();
      if (!text || busy) return;

      setThread((prev) => [...prev, { role: "user", text, blocks: [] }]);
      setQuery("");
      setBusy(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text, persona, locale }),
        });

        if (res.status === 503) {
          setThread((prev) => [...prev, { role: "assistant", text: t("unavailable"), blocks: [] }]);
          return;
        }
        if (res.status === 429) {
          setThread((prev) => [...prev, { role: "assistant", text: t("unavailable"), blocks: [] }]);
          return;
        }
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = (await res.json()) as ChatResponse;
        setThread((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.reply ?? "",
            blocks: data.blocks ?? [],
            suggestions: data.suggestions ?? [],
          },
        ]);
      } catch {
        setThread((prev) => [...prev, { role: "assistant", text: t("parseError"), blocks: [] }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, query, persona, locale, t],
  );

  const lastMessage = thread[thread.length - 1];
  const followUps =
    !busy && lastMessage?.role === "assistant" ? (lastMessage.suggestions ?? []) : [];
  const activeSuggestions = thread.length === 0 ? suggestions : followUps;

  return (
    <>
      <button
        type="button"
        className={["ai-launcher", open ? "hidden" : ""].filter(Boolean).join(" ")}
        onClick={() => setOpen(true)}
        aria-label={t("ask")}
      >
        <span className="ai-launcher-orb">
          <AIMark size={15} />
        </span>
        <span>{t("ask")}</span>
        <kbd>⌘K</kbd>
      </button>

      <div
        className={["ai-panel", open ? "open" : ""].filter(Boolean).join(" ")}
        role="dialog"
        aria-label={t("title")}
        aria-hidden={!open}
      >
        <div className="ai-panel-head">
          <div className="ai-head-title">
            <span className="ai-orb-sm">
              <AIMark size={18} />
            </span>
            <div>
              <div className="t">{t("title")}</div>
              <div className="s">{t("viewingAs")}</div>
            </div>
          </div>
          <button
            type="button"
            className="ai-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="ai-thread" ref={scrollRef}>
          {thread.length === 0 && (
            <div className="ai-empty">
              <div className="ai-empty-orb">
                <AIMark size={26} animated />
              </div>
              <p>{t("empty")}</p>
            </div>
          )}

          {thread.map((m, i) =>
            m.role === "user" ? (
              <div className="ai-msg-user" key={i}>
                {m.text}
              </div>
            ) : (
              <div className="ai-msg-ai" key={i}>
                {m.text && <p className="ai-reply">{m.text}</p>}
                {m.blocks.map((b, j) => (
                  <div className="ai-block-wrap" key={j}>
                    <AIBlockRenderer
                      block={b}
                      context={{
                        projects,
                        skills,
                        socials,
                        locale,
                        onOpenProject: handleOpenProject,
                      }}
                    />
                  </div>
                ))}
              </div>
            ),
          )}

          {busy && (
            <div className="ai-msg-ai">
              <div className="ai-typing" aria-label="Thinking">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {activeSuggestions.length > 0 && (
          <div className="ai-suggestions">
            {activeSuggestions.map((s) => (
              <button type="button" key={s} onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="ai-input"
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !query.trim()} aria-label="Send">
            <ArrowUpRightIcon />
          </button>
        </form>
      </div>

      <button
        type="button"
        className={["ai-scrim", open ? "on" : ""].filter(Boolean).join(" ")}
        onClick={() => setOpen(false)}
        aria-label="Close AI panel"
        tabIndex={-1}
      />
    </>
  );
}
