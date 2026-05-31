"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, AlertTriangle, Check, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  message?: string;
  kind?: ToastKind;
  duration?: number;
}

interface ToastEntry {
  id: string;
  title: string;
  message?: string;
  kind: ToastKind;
  duration: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3200;
const DEFAULT_KIND: ToastKind = "success";
const MAX_TOASTS = 4;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === "success") return <Check aria-hidden="true" />;
  if (kind === "error") return <AlertCircle aria-hidden="true" />;
  if (kind === "warning") return <AlertTriangle aria-hidden="true" />;
  return <Info aria-hidden="true" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setMounted(true);
    const map = timers.current;
    return () => {
      for (const t of map.values()) clearTimeout(t);
      map.clear();
    };
  }, []);

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      clearTimer(id);
    },
    [clearTimer],
  );

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = makeId();
      const entry: ToastEntry = {
        id,
        title: opts.title,
        message: opts.message,
        kind: opts.kind ?? DEFAULT_KIND,
        duration: opts.duration ?? DEFAULT_DURATION,
      };
      setToasts((prev) => {
        const next = [...prev, entry];
        if (next.length <= MAX_TOASTS) return next;
        const dropped = next.slice(0, next.length - MAX_TOASTS);
        for (const d of dropped) clearTimer(d.id);
        return next.slice(-MAX_TOASTS);
      });
      const timer = setTimeout(() => dismiss(id), entry.duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss, clearTimer],
  );

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div className="admin-toast-host" role="region" aria-label="Notifications">
            {toasts.map((t) => (
              <div
                key={t.id}
                role="status"
                className={`admin-toast-item is-${t.kind}`}
                onClick={() => dismiss(t.id)}
              >
                <span className={`admin-toast-icon is-${t.kind}`} aria-hidden="true">
                  <ToastIcon kind={t.kind} />
                </span>
                <div className="admin-toast-body">
                  <div className="admin-toast-title">{t.title}</div>
                  {t.message && <div className="admin-toast-message">{t.message}</div>}
                </div>
                <button
                  type="button"
                  className="admin-toast-close"
                  aria-label="Dismiss notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(t.id);
                  }}
                >
                  <X aria-hidden="true" />
                </button>
                <span
                  className="admin-toast-progress"
                  aria-hidden="true"
                  style={{ animationDuration: `${t.duration}ms` }}
                />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
