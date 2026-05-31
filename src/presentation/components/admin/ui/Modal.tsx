"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

// Module-scope ref count so stacked modals don't fight over body.style.overflow.
// The last modal to mount sets it, the last to unmount restores. Without this,
// inner modals (e.g. confirm dialog opened from a form modal) would restore on
// unmount and leave the body permanently locked.
let __bodyLockCount = 0;
let __bodyLockOriginalOverflow: string | null = null;

function lockBody() {
  if (typeof document === "undefined") return;
  if (__bodyLockCount === 0) {
    __bodyLockOriginalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  __bodyLockCount++;
}

function unlockBody() {
  if (typeof document === "undefined") return;
  __bodyLockCount = Math.max(0, __bodyLockCount - 1);
  if (__bodyLockCount === 0) {
    document.body.style.overflow = __bodyLockOriginalOverflow ?? "";
    __bodyLockOriginalOverflow = null;
  }
}

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  footer,
  children,
  className,
  closeOnBackdrop = true,
  showClose = true,
}: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveRef.current = document.activeElement;

    const box = boxRef.current;
    if (box) {
      const focusable = box.querySelector<HTMLElement>(FOCUSABLE);
      focusable?.focus();
    }

    lockBody();

    return () => {
      unlockBody();
      const prev = previousActiveRef.current;
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx("admin-modal-box", `admin-modal-${size}`, className)}
      >
        {(title || showClose) && (
          <header className="admin-modal-head">
            {title && <h2 className="admin-modal-title">{title}</h2>}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="admin-modal-close"
                aria-label="Close dialog"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </header>
        )}
        <div className="admin-modal-body">{children}</div>
        {footer && <footer className="admin-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}
