import { getTranslations } from "next-intl/server";

import { container } from "@/infrastructure/container";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { InboxFilters, type InboxFilter } from "@/presentation/components/admin/inbox/InboxFilters";
import { MarkAllReadButton } from "@/presentation/components/admin/inbox/MarkAllReadButton";
import { MessageDetail } from "@/presentation/components/admin/inbox/MessageDetail";
import { MessageList } from "@/presentation/components/admin/inbox/MessageList";
import type { InboxServerActions } from "@/presentation/components/admin/inbox/MessageActions";

import {
  deleteMessageAction,
  markAllReadAction,
  markReadAction,
  markUnreadAction,
} from "./actions";

interface InboxPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; id?: string }>;
}

function parseFilter(value: string | undefined): InboxFilter {
  return value === "unread" ? "unread" : "all";
}

function listOptsFor(filter: InboxFilter): { unreadOnly?: boolean; archived?: boolean } {
  switch (filter) {
    case "unread":
      return { unreadOnly: true, archived: false };
    case "all":
    default:
      return { archived: false };
  }
}

export default async function InboxPage({ params, searchParams }: InboxPageProps) {
  const { locale } = await params;
  const { filter: filterParam, id } = await searchParams;
  const filter = parseFilter(filterParam);

  const [messages, totalAll, selected, t] = await Promise.all([
    container.useCases.listMessages.execute(listOptsFor(filter)),
    container.useCases.listMessages.execute({ archived: false }),
    id ? container.useCases.getMessage.execute(id) : Promise.resolve(null),
    getTranslations("admin.inbox"),
  ]);

  const unreadCount = totalAll.filter((m) => !m.read).length;
  const totalCount = totalAll.length;

  if (selected && !selected.read) {
    await container.useCases.markMessageRead.execute(selected.id);
  }

  const actions: InboxServerActions = {
    markRead: markReadAction,
    markUnread: markUnreadAction,
    delete: deleteMessageAction,
  };

  return (
    <div>
      <PageHead
        title={t("title")}
        lead={t("lead")}
        actions={
          <>
            <InboxFilters
              locale={locale}
              current={filter}
              totalCount={totalCount}
              unreadCount={unreadCount}
            />
            <MarkAllReadButton
              locale={locale}
              disabled={unreadCount === 0}
              action={markAllReadAction}
            />
          </>
        }
      />

      <div className="admin-inbox-grid">
        <MessageList locale={locale} filter={filter} messages={messages} selectedId={id ?? null} />
        <MessageDetail locale={locale} message={selected} actions={actions} />
      </div>
    </div>
  );
}
