import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { ContactMessage } from "@/domain/entities/ContactMessage";
import { MessageActions, type InboxServerActions } from "./MessageActions";
import { MessageHeadActions } from "./MessageHeadActions";

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
      <section className="admin-msg-detail">
        <div className="admin-msg-empty-state">
          <Mail size={32} className="admin-msg-empty-icon" />
          <span>{t("selectOne")}</span>
        </div>
      </section>
    );
  }

  const subject = message.subject?.trim() || "—";

  return (
    <section className="admin-msg-detail">
      <div className="admin-msg-detail-head">
        <div>
          <h2>{subject}</h2>
          <div className="meta">
            <strong>{message.from}</strong> · {message.email}
            <br />
            {t("received")}{" "}
            <time dateTime={message.createdAt.toISOString()}>
              {formatDateTime(message.createdAt, locale)}
            </time>
          </div>
        </div>
        <div className="head-actions">
          <MessageHeadActions
            id={message.id}
            locale={locale}
            read={message.read}
            actions={actions}
          />
        </div>
      </div>

      <div className="body">
        {message.body.split("\n").map((line, i) => (
          <p key={i}>{line || " "}</p>
        ))}
      </div>

      <div className="actions">
        <MessageActions
          id={message.id}
          locale={locale}
          email={message.email}
          subject={message.subject}
        />
      </div>
    </section>
  );
}
