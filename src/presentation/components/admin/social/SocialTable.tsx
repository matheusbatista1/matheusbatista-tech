"use client";

import { useState, useTransition, type DragEvent } from "react";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { SocialRow } from "./SocialRow";
import type { SocialActions } from "./types";

interface SocialTableProps {
  links: SocialLink[];
  actions: SocialActions;
  onEdit: (link: SocialLink) => void;
  onReorder: (next: SocialLink[]) => void;
}

export function SocialTable({ links, actions, onEdit, onReorder }: SocialTableProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [, startMutation] = useTransition();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    return (event: DragEvent<HTMLLIElement>) => {
      setDragIndex(index);
      event.dataTransfer.effectAllowed = "move";
      try {
        event.dataTransfer.setData("text/plain", String(index));
      } catch {
        /* some browsers throw if dataTransfer is locked */
      }
    };
  }

  function handleDragOver(index: number) {
    return (event: DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (overIndex !== index) setOverIndex(index);
    };
  }

  function handleDragLeave() {
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDrop(index: number) {
    return (event: DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      setOverIndex(null);
      const from = dragIndex;
      setDragIndex(null);
      if (from === null || from === index) return;

      const next = [...links];
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(index, 0, moved);

      onReorder(next);
      const orderedIds = next.map((link) => link.id);
      startMutation(async () => {
        const result = await actions.reorder(orderedIds);
        if (result.error) toast({ title: result.error, kind: "error" });
      });
    };
  }

  async function handleDelete(link: SocialLink) {
    const ok = await confirm({
      title: "Delete link?",
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
      toast({ title: "Link deleted", kind: "success" });
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
    <ul className="admin-social-list" role="list">
      {links.map((link, index) => (
        <SocialRow
          key={link.id}
          link={link}
          dragging={dragIndex === index}
          dropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
          onEdit={() => onEdit(link)}
          onDelete={() => handleDelete(link)}
          onToggleVisible={(next) => handleToggleVisible(link, next)}
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop(index)}
          onDragEnd={handleDragEnd}
        />
      ))}
    </ul>
  );
}
