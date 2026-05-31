"use client";

import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { DragEvent } from "react";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { IconButton } from "@/presentation/components/admin/ui/IconButton";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";

import { SocialIcon } from "./iconMap";

interface SocialRowProps {
  link: SocialLink;
  dragging: boolean;
  dropTarget: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: (next: boolean) => void;
  onDragStart: (event: DragEvent<HTMLLIElement>) => void;
  onDragOver: (event: DragEvent<HTMLLIElement>) => void;
  onDragLeave: (event: DragEvent<HTMLLIElement>) => void;
  onDrop: (event: DragEvent<HTMLLIElement>) => void;
  onDragEnd: (event: DragEvent<HTMLLIElement>) => void;
}

export function SocialRow({
  link,
  dragging,
  dropTarget,
  onEdit,
  onDelete,
  onToggleVisible,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: SocialRowProps) {
  return (
    <li
      className="admin-social-row"
      draggable
      data-dragging={dragging ? "true" : "false"}
      data-drop-target={dropTarget ? "true" : "false"}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
        <GripVertical size={16} aria-hidden="true" />
      </span>

      <span className="icon">
        <SocialIcon iconKey={link.iconKey} size={18} />
      </span>

      <span className="name">{link.name}</span>

      <a className="url" href={link.url} target="_blank" rel="noopener noreferrer">
        {link.handle ?? link.url}
      </a>

      <Toggle
        checked={link.visible}
        onCheckedChange={onToggleVisible}
        aria-label={link.visible ? "Hide link" : "Show link"}
      />

      <div className="actions">
        <IconButton
          aria-label={`Edit ${link.name}`}
          tooltip="Edit"
          icon={<Pencil size={14} />}
          onClick={onEdit}
        />
        <IconButton
          aria-label={`Delete ${link.name}`}
          tooltip="Delete"
          icon={<Trash2 size={14} />}
          onClick={onDelete}
        />
      </div>
    </li>
  );
}
