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

function formatRelative(date: Date, locale: string): string {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), "hour");
  if (abs < WEEK) return rtf.format(Math.round(diff / DAY), "day");
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
}

function previewBody(body: string): string {
  const oneLine = body.replace(/\s+/g, " ").trim();
  return oneLine.length > 120 ? `${oneLine.slice(0, 117)}…` : oneLine;
}

export function MessageRow({ locale, filter, message, selected }: MessageRowProps) {
  const unread = !message.read;
  const subject = message.subject?.trim() || message.body.split("\n")[0]?.slice(0, 80) || "—";

  return (
    <Link
      href={`/${locale}/admin/inbox?filter=${filter}&id=${message.id}`}
      className={cx("admin-msg-item", unread && "is-unread", selected && "is-selected")}
      aria-current={selected ? "true" : undefined}
    >
      <div className="head">
        <span className="from">
          {unread && <span className="dot-unread" aria-hidden="true" />}
          {message.from}
        </span>
        <span className="when">{formatRelative(message.createdAt, locale)}</span>
      </div>
      <div className="subject">{subject}</div>
      <div className="preview">{previewBody(message.body)}</div>
    </Link>
  );
}
