"use client";

import { Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface PaletteItem {
  key: string;
  href: string;
  label: string;
}

interface AdminCommandPaletteProps {
  items: PaletteItem[];
  placeholder: string;
}

function score(query: string, label: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const l = label.toLowerCase();
  if (l === q) return 1000;
  if (l.startsWith(q)) return 800;
  if (l.includes(q)) return 600;
  // Subsequence match — characters of q appear in order somewhere in l.
  let i = 0;
  let matches = 0;
  for (const ch of l) {
    if (ch === q[i]) {
      i += 1;
      matches += 1;
      if (i === q.length) break;
    }
  }
  if (i === q.length) return 200 + matches;
  return 0;
}

export function AdminCommandPalette({ items, placeholder }: AdminCommandPaletteProps) {
  const t = useTranslations("admin.shell");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    if (query.trim().length === 0) return items;
    return items
      .map((item) => ({ item, score: score(query.trim(), item.label) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (!open) return;
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
      router.push(href);
    },
    [router],
  );

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    if (!open) setOpen(true);
  }

  function onFocus() {
    setOpen(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) navigate(target.href);
    }
  }

  const showDropdown = open && results.length > 0;

  return (
    <div ref={containerRef} className="admin-topbar-search admin-command" role="search">
      <Search aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        aria-label={t("search")}
        value={query}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      <kbd aria-hidden="true">{"⌘K"}</kbd>
      {showDropdown ? (
        <ul className="admin-command-results" role="listbox" aria-label={t("search")}>
          {results.map((item, idx) => (
            <li
              key={item.key}
              role="option"
              aria-selected={idx === activeIndex ? "true" : "false"}
              className={["admin-command-item", idx === activeIndex ? "is-active" : ""]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(event) => {
                event.preventDefault();
                navigate(item.href);
              }}
            >
              <span className="admin-command-label">{item.label}</span>
              <span className="admin-command-href">{item.href}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
