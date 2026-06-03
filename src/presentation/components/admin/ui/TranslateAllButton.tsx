"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { LOCALES, type Locale } from "@/domain/value-objects/Locale";
import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

interface TranslateAllButtonProps {
  /** The locale currently being edited (acts as the source text). */
  sourceLocale: Locale;
  /** Returns the current source text to translate. */
  getSourceText: () => string;
  /** Called once per target locale with the translated value. */
  onTranslated: (target: Locale, value: string) => void;
  /** Optional label override (defaults to the admin.translate i18n key). */
  label?: string;
  /** Optional toast title override. */
  successToastTitle?: string;
  /** When `true` shows only the icon. Defaults to false. */
  iconOnly?: boolean;
}

/**
 * Calls POST /api/ai/translate with the current source text, then propagates
 * the result to all non-source locales via onTranslated. Errors and "nothing
 * to translate" cases are surfaced via toasts.
 */
export function TranslateAllButton({
  sourceLocale,
  getSourceText,
  onTranslated,
  label,
  successToastTitle,
  iconOnly = false,
}: TranslateAllButtonProps) {
  const t = useTranslations("admin");
  const { toast } = useToast();

  async function run() {
    const current = getSourceText().trim();
    if (current.length === 0) {
      toast({ title: "Nothing to translate", message: "Write some copy first.", kind: "info" });
      return;
    }

    const targets = LOCALES.filter((l) => l !== sourceLocale);
    const response = await fetch("/api/ai/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: current, from: sourceLocale, targets }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }

    const data = (await response.json()) as { translated: Record<string, string> };
    for (const target of targets) {
      const value = data.translated?.[target];
      if (typeof value === "string" && value.length > 0) {
        onTranslated(target, value);
      }
    }

    toast({ title: successToastTitle ?? t("translateAll"), kind: "success" });
  }

  const buttonLabel = label ?? t("translateAll");
  return (
    <AIButton
      onRun={run}
      label={iconOnly ? "" : buttonLabel}
      icon={<Languages size={14} />}
      title={buttonLabel}
    />
  );
}
