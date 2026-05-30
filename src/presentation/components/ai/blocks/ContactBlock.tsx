"use client";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { ArrowUpRightIcon } from "@/presentation/components/icons/Icons";

interface ContactBlockProps {
  socials: SocialLink[];
}

export function ContactBlock({ socials }: ContactBlockProps) {
  return (
    <div className="ai-contact">
      {socials.map((s) => (
        <a
          key={s.id}
          className="ai-contact-row"
          href={s.url}
          target={s.url.startsWith("http") ? "_blank" : undefined}
          rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          <span className="lbl">{s.name}</span>
          <span className="val">{s.handle ?? s.url}</span>
          <ArrowUpRightIcon />
        </a>
      ))}
    </div>
  );
}
