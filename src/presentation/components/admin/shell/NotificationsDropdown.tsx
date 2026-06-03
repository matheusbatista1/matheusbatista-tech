"use client";

import { Bell, FileDown, Mail, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Source = "message" | "cv" | "error";

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string | null;
  createdAt: string;
  href: string;
}

interface SourceSummary {
  unread: number;
  latest: NotificationItem[];
}

interface NotificationsResponse {
  messages: SourceSummary;
  cv: SourceSummary;
  errors: SourceSummary;
}

const POLL_INTERVAL_MS = 60_000;

const SECTION_META: Record<
  Source,
  { label: string; icon: typeof Bell; allHref: string; allLabel: string }
> = {
  message: {
    label: "Messages",
    icon: Mail,
    allHref: "/admin/inbox",
    allLabel: "Open inbox",
  },
  cv: {
    label: "CV downloads",
    icon: FileDown,
    allHref: "/admin/analytics",
    allLabel: "View analytics",
  },
  error: {
    label: "Errors",
    icon: AlertTriangle,
    allHref: "/admin/logs",
    allLabel: "Open logs",
  },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function NotificationsDropdown() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const totalUnread =
    (data?.messages.unread ?? 0) + (data?.cv.unread ?? 0) + (data?.errors.unread ?? 0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as NotificationsResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (sources: Source[]) => {
    if (sources.length === 0) return;
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sources }),
    });
  }, []);

  useEffect(() => {
    void fetchData();
    const id = window.setInterval(fetchData, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onToggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      // Refresh on open + mark any source with unread items as read.
      await fetchData();
      if (data) {
        const sourcesToMark: Source[] = [];
        if (data.messages.unread > 0) sourcesToMark.push("message");
        if (data.cv.unread > 0) sourcesToMark.push("cv");
        if (data.errors.unread > 0) sourcesToMark.push("error");
        if (sourcesToMark.length > 0) {
          void markRead(sourcesToMark);
        }
      }
    }
  }

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function renderSection(source: Source, summary: SourceSummary | undefined) {
    const meta = SECTION_META[source];
    const Icon = meta.icon;
    const items = summary?.latest ?? [];
    const unread = summary?.unread ?? 0;
    return (
      <div className="admin-notif-section" key={source}>
        <div className="admin-notif-section-head">
          <Icon size={13} aria-hidden="true" />
          <span className="admin-notif-section-label">{meta.label}</span>
          {unread > 0 ? <span className="admin-notif-section-count">{unread}</span> : null}
        </div>
        {items.length === 0 ? (
          <p className="admin-notif-empty">Nothing new.</p>
        ) : (
          <ul className="admin-notif-list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="admin-notif-item"
                  onClick={() => navigateTo(item.href)}
                >
                  <span className="admin-notif-item-title">{item.title}</span>
                  {item.subtitle ? (
                    <span className="admin-notif-item-sub">{item.subtitle}</span>
                  ) : null}
                  <span className="admin-notif-item-time">{relativeTime(item.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="admin-notif-section-cta"
          onClick={() => navigateTo(meta.allHref)}
        >
          {meta.allLabel} →
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="admin-notif-wrap">
      <button
        type="button"
        className="admin-topbar-bell"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={onToggle}
      >
        <Bell aria-hidden="true" width={16} height={16} />
        {totalUnread > 0 ? <span className="dot" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div className="admin-notif-panel" role="dialog" aria-label="Notifications">
          <div className="admin-notif-panel-head">
            <span>Notifications</span>
            {loading ? <span className="admin-notif-loading">refreshing…</span> : null}
          </div>
          {renderSection("message", data?.messages)}
          {renderSection("cv", data?.cv)}
          {renderSection("error", data?.errors)}
        </div>
      ) : null}
    </div>
  );
}
