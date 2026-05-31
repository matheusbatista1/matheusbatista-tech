import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { ContactMessage } from "@/domain/entities/ContactMessage";
import { Card } from "@/presentation/components/admin/ui/Card";

interface RecentMessagesProps {
  messages: ContactMessage[];
  locale: string;
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

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export async function RecentMessages({ messages, locale }: RecentMessagesProps) {
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  return (
    <Card padding="md" header={{ title: t("recentMessages") }}>
      <table className="admin-tbl">
        <thead>
          <tr>
            <th>{t("table.from")}</th>
            <th>{t("table.subject")}</th>
            <th>{t("table.received")}</th>
            <th>
              <span className="visually-hidden">{t("table.received")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-tbl-empty">
                {t("noMessages")}
              </td>
            </tr>
          ) : (
            messages.map((m) => {
              const subject = m.subject?.trim() || m.body.split("\n")[0]?.slice(0, 80) || "—";
              return (
                <tr key={m.id} className="admin-tbl-row-link">
                  <td>
                    <Link
                      href={`/${locale}/admin/inbox?id=${m.id}`}
                      className="admin-tbl-row-cover"
                      aria-label={`${m.from} — ${subject}`}
                    />
                    {!m.read && <span className="dot-unread" aria-hidden="true" />}
                    <strong>{m.from}</strong>
                  </td>
                  <td className="admin-tbl-cell-mute admin-tbl-cell-truncate">{subject}</td>
                  <td className="admin-tbl-cell-dim">{formatRelative(m.createdAt, locale)}</td>
                  <td className="admin-tbl-cell-dim admin-tbl-cell-action">
                    <ArrowUpRight />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Card>
  );
}
