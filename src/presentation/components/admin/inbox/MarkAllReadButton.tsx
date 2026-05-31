"use client";

import { CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/presentation/components/admin/ui/Button";

interface MarkAllReadButtonProps {
  locale: string;
  disabled?: boolean;
  action: (formData: FormData) => Promise<void>;
}

export function MarkAllReadButton({ locale, disabled, action }: MarkAllReadButtonProps) {
  const t = useTranslations("admin.inbox");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="default"
      size="sm"
      icon={<CheckCheck size={14} />}
      loading={pending}
      disabled={disabled}
      onClick={() =>
        startTransition(async () => {
          const data = new FormData();
          data.set("locale", locale);
          await action(data);
        })
      }
    >
      {t("markAllRead")}
    </Button>
  );
}
