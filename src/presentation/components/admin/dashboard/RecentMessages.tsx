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

export async function RecentMessages({ messages, locale }: RecentMessagesProps) {
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  return (
    <Card padding="md" header={{ title: t("recentMessages") }}>
      {messages.length === 0 ? (
        <p className="admin-empty">{t("noMessages")}</p>
      ) : (
        <ul className="admin-msg-rows">
          {messages.map((m) => {
            const subject = m.subject?.trim() || m.body.split("\n")[0]?.slice(0, 80) || "—";
            return (
              <li key={m.id}>
                <Link
                  href={`/${locale}/admin/inbox?id=${m.id}`}
                  className="admin-msg-row"
                  data-unread={!m.read ? "true" : undefined}
                >
                  <div className="admin-msg-row-head">
                    <span className="admin-msg-row-from">{m.from}</span>
                    <span className="admin-msg-row-when">
                      {formatRelative(m.createdAt, locale)}
                    </span>
                  </div>
                  <div className="admin-msg-row-subject">{subject}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
