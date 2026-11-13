import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { ExportButton, PageHeader, Pill } from "@/components/admin/data-table";
import { setHandledAction } from "./actions";

export default async function MessagesPage() {
  // Unread first, then newest first.
  const rows = await db.select().from(contactMessages).orderBy(asc(contactMessages.handled), desc(contactMessages.createdAt));
  const unread = rows.filter((r) => !r.handled).length;

  return (
    <>
      <PageHeader title="Messages" count={rows.length}>
        <ExportButton kind="messages" />
      </PageHeader>
      <p className="-mt-3 mb-4 text-sm text-muted-foreground">{unread} unread</p>

      <div className="grid gap-4">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {rows.map((m) => (
          <article key={m.id} className={`rounded-lg border border-border bg-white p-5 ${m.handled ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">
                  {m.firstName} {m.lastName} {!m.handled && <Pill tone="amber">Unread</Pill>}
                </p>
                <p className="text-sm text-muted-foreground">
                  <a href={`mailto:${m.email}`} className="hover:underline">
                    {m.email}
                  </a>
                  {m.phone && <> &middot; {m.phone}</>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })}
                </p>
              </div>
              <form action={setHandledAction.bind(null, m.id, !m.handled)}>
                <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-zinc-50">
                  {m.handled ? "Mark unread" : "Mark handled"}
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          </article>
        ))}
      </div>
    </>
  );
}
