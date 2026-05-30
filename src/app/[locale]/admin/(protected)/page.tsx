import { container } from "@/infrastructure/container";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const messages = await container.useCases.listMessages.execute();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>Inbox</h1>
        <span className="admin-counter">
          <b>{unread}</b> unread · {messages.length} total
        </span>
      </div>

      {messages.length === 0 ? (
        <p className="admin-empty">No messages yet. The contact form will fill this in.</p>
      ) : (
        <ul className="admin-msg-list">
          {messages.map((m) => (
            <li
              key={m.id}
              className={["admin-msg", m.read ? "" : "unread"].filter(Boolean).join(" ")}
            >
              <div className="admin-msg-head">
                <span className="admin-msg-from">{m.from}</span>
                <a className="admin-msg-email" href={`mailto:${m.email}`}>
                  {m.email}
                </a>
                <span className="admin-msg-date">{formatDate(m.createdAt)}</span>
              </div>
              {m.subject && <div className="admin-msg-subject">{m.subject}</div>}
              <p className="admin-msg-body">{m.body}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="admin-todo">
        {/* TODO(fase 2): editors de Hero, About, Projects, Skills, Social, Settings */}
        Next up: editors for Hero, About, Projects, Skills, Social and Settings.
      </p>
    </div>
  );
}
