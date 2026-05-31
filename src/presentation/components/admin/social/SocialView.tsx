"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { Button } from "@/presentation/components/admin/ui/Button";

import { SocialModal } from "./SocialModal";
import { SocialTable } from "./SocialTable";
import type { SocialActions } from "./types";
import "./social.css";

interface SocialViewProps {
  links: SocialLink[];
  actions: SocialActions;
}

export function SocialView({ links, actions }: SocialViewProps) {
  const [items, setItems] = useState<SocialLink[]>(links);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);

  // Re-sync when the server reloads (after revalidation)
  useEffect(() => {
    setItems(links);
  }, [links]);

  return (
    <>
      <div className="admin-social-toolbar">
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          New link
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="admin-social-empty">
          No social links yet. Click “New link” to add the first one.
        </div>
      ) : (
        <SocialTable
          links={items}
          actions={actions}
          onEdit={(link) => setEditing(link)}
          onReorder={setItems}
        />
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
