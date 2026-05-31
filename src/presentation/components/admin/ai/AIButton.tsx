"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, type ReactNode } from "react";

import { Button, type ButtonSize } from "@/presentation/components/admin/ui/Button";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

export interface AIButtonProps {
  onRun: () => Promise<void>;
  disabled?: boolean;
  label?: string;
  icon?: ReactNode;
  title?: string;
  size?: ButtonSize;
}

export function AIButton({
  onRun,
  disabled = false,
  label,
  icon,
  title,
  size = "sm",
}: AIButtonProps) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();

  const handleClick = useCallback(async () => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      await onRun();
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      let errorTitle: string;
      try {
        errorTitle = t("admin.ai.error");
      } catch {
        errorTitle = "Something went wrong";
      }
      toast({ title: errorTitle, message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }, [busy, disabled, onRun, toast, t]);

  let thinkingTitle: string;
  try {
    thinkingTitle = t("admin.ai.thinking");
  } catch {
    thinkingTitle = "Thinking...";
  }

  const resolvedIcon = icon ?? <Sparkles size={size === "sm" ? 14 : 16} aria-hidden="true" />;

  return (
    <Button
      variant="ai"
      size={size}
      icon={resolvedIcon}
      loading={busy}
      disabled={disabled || busy}
      title={busy ? thinkingTitle : title}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
