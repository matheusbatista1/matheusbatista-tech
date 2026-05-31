"use client";

import { AlertTriangle } from "lucide-react";
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

import { Button } from "@/presentation/components/admin/ui/Button";

export interface ConfirmOptions {
  title: string;
  message?: string;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

interface PendingConfirm {
  opts: ConfirmOptions;
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [mounted, setMounted] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolveWith = useCallback(
    (value: boolean) => {
      if (!pending) return;
      pending.resolve(value);
      setPending(null);
    },
    [pending],
  );

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ opts, resolve });
      }),
    [],
  );

  useEffect(() => {
    if (!pending) return;

    confirmBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resolveWith(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        resolveWith(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, resolveWith]);

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {mounted && pending
        ? createPortal(
            <div
              className="admin-modal-backdrop"
              role="presentation"
              onClick={() => resolveWith(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-confirm-title"
                className={`admin-modal ${pending.opts.danger ? "is-danger" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-modal-header">
                  {pending.opts.danger && (
                    <span className="admin-modal-icon" aria-hidden="true">
                      <AlertTriangle size={20} />
                    </span>
                  )}
                  <h2 id="admin-confirm-title" className="admin-modal-title">
                    {pending.opts.title}
                  </h2>
                </div>

                {pending.opts.message && (
                  <p className="admin-modal-message">{pending.opts.message}</p>
                )}

                <div className="admin-modal-actions">
                  <Button variant="ghost" onClick={() => resolveWith(false)}>
                    {pending.opts.cancelLabel ?? "Cancel"}
                  </Button>
                  <Button
                    ref={confirmBtnRef}
                    variant={pending.opts.danger ? "danger-solid" : "primary"}
                    onClick={() => resolveWith(true)}
                  >
                    {pending.opts.confirmLabel ?? "Confirm"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}
