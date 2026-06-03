"use client";

import { Search, Folder, Sparkles, Mail, Link2, FileText } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type KeyboardEvent,
  type SVGProps,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Group = "page" | "project" | "skill" | "message" | "social" | "content";

interface PaletteItem {
  key: string;
  href: string;
  label: string;
}

interface AdminCommandPaletteProps {
  items: PaletteItem[];
  placeholder: string;
}

interface ContentHit {
  id: string;
  group: Group;
  label: string;
  sublabel: string | null;
  href: string;
}

interface ContentSearchResponse {
  groups: Partial<Record<Exclude<Group, "page">, ContentHit[]>>;
}

const GROUP_META: Record<Group, { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  page: { label: "Pages", icon: Search },
  project: { label: "Projects", icon: Folder },
  skill: { label: "Skills", icon: Sparkles },
  message: { label: "Messages", icon: Mail },
  social: { label: "Social", icon: Link2 },
  content: { label: "Site content", icon: FileText },
};

const DEBOUNCE_MS = 220;
const MIN_QUERY = 2;

function pageScore(query: string, label: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const l = label.toLowerCase();
  if (l === q) return 1000;
  if (l.startsWith(q)) return 800;
  if (l.includes(q)) return 600;
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentHits, setContentHits] = useState<ContentSearchResponse["groups"]>({});
  const [loading, setLoading] = useState(false);

  // Page-level matches (always done client-side against the static nav list).
  const pageMatches = useMemo<ContentHit[]>(() => {
    if (query.trim().length === 0) {
      return items.map((item) => ({
        id: item.key,
        group: "page",
        label: item.label,
        sublabel: item.href,
        href: item.href,
      }));
    }
    return items
      .map((item) => ({ item, score: pageScore(query.trim(), item.label) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => ({
        id: item.key,
        group: "page",
        label: item.label,
        sublabel: item.href,
        href: item.href,
      }));
  }, [items, query]);

  // Debounce + fetch the content search endpoint.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setDebouncedQuery("");
      setContentHits({});
      return;
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(q);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("search failed"))))
      .then((data: ContentSearchResponse) => {
        setContentHits(data.groups ?? {});
        setLoading(false);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  // Flat ordered list used for arrow-key navigation + the dropdown render.
  const orderedGroups = useMemo<{ group: Group; hits: ContentHit[] }[]>(() => {
    const groups: { group: Group; hits: ContentHit[] }[] = [
      { group: "page", hits: pageMatches },
      { group: "project", hits: contentHits.project ?? [] },
      { group: "skill", hits: contentHits.skill ?? [] },
      { group: "message", hits: contentHits.message ?? [] },
      { group: "social", hits: contentHits.social ?? [] },
      { group: "content", hits: contentHits.content ?? [] },
    ];
    return groups.filter((g) => g.hits.length > 0);
  }, [pageMatches, contentHits]);

  const flatHits = useMemo<ContentHit[]>(
    () => orderedGroups.flatMap((g) => g.hits),
    [orderedGroups],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [flatHits.length, query]);

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
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
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
      setActiveIndex((i) => Math.min(flatHits.length - 1, i + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = flatHits[activeIndex];
      if (target) navigate(target.href);
    }
  }

  const showDropdown = open && (flatHits.length > 0 || loading);
  let runningIndex = 0;

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
        <div className="admin-command-results" aria-label={t("search")}>
          {loading && flatHits.length === 0 ? (
            <div className="admin-command-loading">Searching…</div>
          ) : null}
          {orderedGroups.map(({ group, hits }) => {
            const meta = GROUP_META[group];
            const Icon = meta.icon;
            return (
              <div key={group} className="admin-command-group">
                <div className="admin-command-group-head">
                  <Icon width={11} height={11} aria-hidden="true" />
                  <span>{meta.label}</span>
                </div>
                {hits.map((hit) => {
                  const itemIndex = runningIndex;
                  runningIndex += 1;
                  return (
                    <button
                      key={`${hit.group}-${hit.id}`}
                      type="button"
                      className={[
                        "admin-command-item",
                        itemIndex === activeIndex ? "is-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onMouseEnter={() => setActiveIndex(itemIndex)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        navigate(hit.href);
                      }}
                    >
                      <span className="admin-command-label">{hit.label}</span>
                      {hit.sublabel ? (
                        <span className="admin-command-href">{hit.sublabel}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
