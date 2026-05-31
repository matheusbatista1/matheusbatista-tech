import { getTranslations } from "next-intl/server";
import type { ContactMessage } from "@/domain/entities/ContactMessage";
import { Card } from "@/presentation/components/admin/ui/Card";
import { MessageRow } from "./MessageRow";
import type { InboxFilter } from "./InboxFilters";

interface MessageListProps {
  locale: string;
  filter: InboxFilter;
  messages: ContactMessage[];
  selectedId: string | null;
}

export async function MessageList({ locale, filter, messages, selectedId }: MessageListProps) {
  const t = await getTranslations("admin.inbox");

  if (messages.length === 0) {
    return (
      <Card padding="md" className="admin-msg-list-card">
        <p className="admin-msg-empty">{t("empty")}</p>
      </Card>
    );
  }

  return (
    <Card padding="md" className="admin-msg-list-card">
      <ul className="admin-msg-list" role="list">
        {messages.map((m) => (
          <li key={m.id}>
            <MessageRow
              locale={locale}
              filter={filter}
              message={m}
              selected={m.id === selectedId}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
