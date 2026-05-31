"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { Card } from "@/presentation/components/admin/ui/Card";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { SocialRow } from "./SocialRow";
import type { SocialActions } from "./types";

interface SocialTableProps {
  links: SocialLink[];
  actions: SocialActions;
  onEdit: (link: SocialLink) => void;
}

export function SocialTable({ links, actions, onEdit }: SocialTableProps) {
  const t = useTranslations("admin.social");
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [, startMutation] = useTransition();

  async function handleDelete(link: SocialLink) {
    const ok = await confirm({
      title: t("confirmDelete"),
      message: `“${link.name}” will be removed permanently.`,
      danger: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;

    startMutation(async () => {
      const result = await actions.delete(link.id);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: t("deleted"), kind: "success" });
    });
  }

  function handleToggleVisible(link: SocialLink, next: boolean) {
    startMutation(async () => {
      const result = await actions.toggleVisible(link.id, next);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({
        title: next ? `${link.name} is now visible` : `${link.name} is hidden`,
        kind: "success",
      });
    });
  }

  return (
    <Card padding="md" className="admin-social-card">
      <table className="admin-tbl admin-social-tbl">
        <thead>
          <tr>
            <th className="admin-social-th-icon" aria-label="Icon" />
            <th>{t("name")}</th>
            <th>
              {t("handle")} / {t("url")}
            </th>
            <th className="admin-social-th-visible">{t("visible")}</th>
            <th className="admin-social-th-actions" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <SocialRow
              key={link.id}
              link={link}
              onEdit={() => onEdit(link)}
              onDelete={() => handleDelete(link)}
              onToggleVisible={(next) => handleToggleVisible(link, next)}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
