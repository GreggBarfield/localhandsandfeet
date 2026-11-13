import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { contactMessages, organizations, projects, volunteers } from "@/db/schema";
import { PageHeader, Pill, STATUS_LABELS, STATUS_TONES } from "@/components/admin/data-table";

export default async function AdminHome() {
  const [volunteerCount, organizationCount, unhandledMessages, byStatus] = await Promise.all([
    db.$count(volunteers),
    db.$count(organizations),
    db.$count(contactMessages, eq(contactMessages.handled, false)),
    db.select({ status: projects.status, n: count() }).from(projects).groupBy(projects.status),
  ]);
  const projectCount = byStatus.reduce((sum, r) => sum + r.n, 0);

  const cards = [
    { label: "Volunteers", value: volunteerCount, href: "/admin/volunteers" },
    { label: "Projects", value: projectCount, href: "/admin/projects" },
    { label: "Organizations", value: organizationCount, href: "/admin/organizations" },
    { label: "Unread messages", value: unhandledMessages, href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const body = (
            <div className="rounded-lg border border-border bg-white p-5">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-4xl font-bold">{c.value}</p>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="hover:opacity-80">
              {body}
            </Link>
          ) : (
            <div key={c.label}>{body}</div>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold">Projects by status</h2>
      <div className="flex flex-wrap gap-3">
        {byStatus.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
        {byStatus.map((r) => (
          <Link key={r.status} href={`/admin/projects?status=${r.status}`} className="rounded-lg border border-border bg-white px-4 py-3 hover:bg-zinc-50">
            <Pill tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Pill>
            <span className="ml-3 text-lg font-bold">{r.n}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
