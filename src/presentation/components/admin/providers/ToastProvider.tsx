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

export type ToastKind = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  message?: string;
  kind?: ToastKind;
  duration?: number;
}

interface ToastEntry {
  id: string;
  opts: Required<Pick<ToastOptions, "title" | "kind" | "duration">> & Pick<ToastOptions, "message">;
  createdAt: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3500;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = makeId();
      const entry: ToastEntry = {
        id,
        opts: {
          title: opts.title,
          message: opts.message,
          kind: opts.kind ?? "info",
          duration: opts.duration ?? DEFAULT_DURATION,
        },
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, entry]);
      const timer = setTimeout(() => dismiss(id), entry.opts.duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div className="admin-toast-stack" role="region" aria-label="Notifications">
            {toasts.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`admin-toast admin-toast-${t.opts.kind}`}
                onClick={() => dismiss(t.id)}
              >
                <div className="admin-toast-body">
                  <div className="admin-toast-title">{t.opts.title}</div>
                  {t.opts.message && <div className="admin-toast-message">{t.opts.message}</div>}
                </div>
                <span
                  className="admin-toast-progress"
                  aria-hidden="true"
                  style={{ animationDuration: `${t.opts.duration}ms` }}
                />
              </button>
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
