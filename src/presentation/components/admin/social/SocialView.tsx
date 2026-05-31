"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { Button } from "@/presentation/components/admin/ui/Button";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";

import { SocialModal } from "./SocialModal";
import { SocialTable } from "./SocialTable";
import type { SocialActions } from "./types";
import "./social.css";

interface SocialViewProps {
  links: SocialLink[];
  actions: SocialActions;
}

export function SocialView({ links, actions }: SocialViewProps) {
  const t = useTranslations("admin.social");
  const [items, setItems] = useState<SocialLink[]>(links);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);

  useEffect(() => {
    setItems(links);
  }, [links]);

  return (
    <>
      <PageHead
        title={t("title")}
        lead={t("lead")}
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
            {t("new")}
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="admin-social-empty">
          No social links yet. Click “{t("new")}” to add the first one.
        </div>
      ) : (
        <SocialTable links={items} actions={actions} onEdit={(link) => setEditing(link)} />
      )}

      {creating && (
        <SocialModal mode="create" actions={actions} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <SocialModal
          mode="edit"
          social={editing}
          actions={actions}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
