import Link from "next/link";
import type { ContactMessage } from "@/domain/entities/ContactMessage";
import type { InboxFilter } from "./InboxFilters";

interface MessageRowProps {
  locale: string;
  filter: InboxFilter;
  message: ContactMessage;
  selected: boolean;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function formatCompactRelative(date: Date): string {
  const diff = Math.abs(Date.now() - date.getTime());
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  return `${Math.floor(diff / WEEK)}w ago`;
}

function previewBody(body: string): string {
  const oneLine = body.replace(/\s+/g, " ").trim();
  return oneLine.length > 120 ? `${oneLine.slice(0, 117)}…` : oneLine;
}

export function MessageRow({ locale, filter, message, selected }: MessageRowProps) {
  const unread = !message.read;
  const subject = message.subject?.trim() || "—";

  return (
    <Link
      href={`/${locale}/admin/inbox?filter=${filter}&id=${message.id}`}
      className={cx("admin-msg-item", unread && "is-unread")}
      aria-current={selected ? "page" : undefined}
    >
      <div className="head">
        <span className="from">{message.from}</span>
        <span className="when">{formatCompactRelative(message.createdAt)}</span>
      </div>
      <div className="subject">{subject}</div>
      <div className="preview">{previewBody(message.body)}</div>
    </Link>
  );
}
