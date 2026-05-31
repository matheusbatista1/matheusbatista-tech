import { Inbox } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { ContactMessage } from "@/domain/entities/ContactMessage";
import { Card } from "@/presentation/components/admin/ui/Card";
import { EmptyState } from "@/presentation/components/admin/ui/EmptyState";
import { MessageActions, type InboxServerActions } from "./MessageActions";

interface MessageDetailProps {
  locale: string;
  message: ContactMessage | null;
  actions: InboxServerActions;
}

function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export async function MessageDetail({ locale, message, actions }: MessageDetailProps) {
  const t = await getTranslations("admin.inbox");

  if (!message) {
    return (
      <Card padding="md" className="admin-msg-detail-card">
        <EmptyState icon={<Inbox size={20} />} title={t("title")} description={t("selectOne")} />
      </Card>
    );
  }

  const subject = message.subject?.trim() || "—";

  return (
    <Card padding="md" className="admin-msg-detail-card">
      <article className="admin-msg-detail">
        <header className="head">
          <div className="from">
            <span className="name">{message.from}</span>
            <a className="email" href={`mailto:${message.email}`}>
              {message.email}
            </a>
          </div>
          <h2 className="subject">{subject}</h2>
          <time className="when" dateTime={message.createdAt.toISOString()}>
            {formatDateTime(message.createdAt, locale)}
          </time>
        </header>

        <div className="body">
          {message.body.split("\n").map((line, i) => (
            <p key={i}>{line || " "}</p>
          ))}
        </div>

        <div className="actions">
          <MessageActions
            id={message.id}
            locale={locale}
            read={message.read}
            archived={message.archived}
            from={message.from}
            email={message.email}
            subject={message.subject}
            body={message.body}
            actions={actions}
          />
        </div>
      </article>
    </Card>
  );
}
