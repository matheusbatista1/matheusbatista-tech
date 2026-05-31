"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { IconButton } from "@/presentation/components/admin/ui/IconButton";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";

import { SocialIcon } from "./iconMap";

interface SocialRowProps {
  link: SocialLink;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: (next: boolean) => void;
}

export function SocialRow({ link, onEdit, onDelete, onToggleVisible }: SocialRowProps) {
  return (
    <tr className="admin-social-tr">
      <td className="admin-social-td-icon">
        <SocialIcon iconKey={link.iconKey} size={18} />
      </td>
      <td className="admin-social-td-name">
        <strong>{link.name}</strong>
      </td>
      <td className="admin-social-td-url" title={link.handle ?? link.url}>
        {link.handle ?? link.url}
      </td>
      <td className="admin-social-td-visible">
        <Toggle
          checked={link.visible}
          onCheckedChange={onToggleVisible}
          aria-label={link.visible ? "Hide link" : "Show link"}
        />
      </td>
      <td className="admin-social-td-actions">
        <div className="admin-social-row-actions">
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
            className="admin-btn-danger"
            onClick={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}
