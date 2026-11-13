import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects, projectStatus } from "@/db/schema";
import { ExportButton, formatDate, PageHeader, Pill, SearchBox, STATUS_LABELS, STATUS_TONES, Table, Td } from "@/components/admin/data-table";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const like = `%${q}%`;
  const status = projectStatus.enumValues.find((s) => s === sp.status);

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      recipientFirstName: projects.recipientFirstName,
      recipientLastName: projects.recipientLastName,
      recipientPhone: projects.recipientPhone,
      startDate: projects.startDate,
      createdAt: projects.createdAt,
      volunteerCount: sql<number>`(select count(*) from project_volunteers pv where pv.project_id = ${projects.id})`.mapWith(Number),
    })
    .from(projects)
    .where(
      and(
        status ? eq(projects.status, status) : undefined,
        q
          ? or(
              ilike(projects.name, like),
              ilike(projects.recipientFirstName, like),
              ilike(projects.recipientLastName, like),
              ilike(projects.recipientAddress, like),
            )
          : undefined,
      ),
    )
    .orderBy(desc(projects.createdAt));

  return (
    <>
      <PageHeader title="Projects" count={rows.length}>
        <ExportButton kind="projects" />
      </PageHeader>
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <a href="/admin/projects" className={`rounded-full border px-3 py-1 ${status ? "border-border bg-white" : "border-zinc-900 bg-zinc-900 text-white"}`}>
          All
        </a>
        {projectStatus.enumValues.map((s) => (
          <a
            key={s}
            href={`/admin/projects?status=${s}`}
            className={`rounded-full border px-3 py-1 ${status === s ? "border-zinc-900 bg-zinc-900 text-white" : "border-border bg-white"}`}
          >
            {STATUS_LABELS[s]}
          </a>
        ))}
      </div>
      <SearchBox q={q} placeholder="Search project, recipient, or address" />
      <Table headers={["Project", "Recipient", "Phone", "Status", "Volunteers", "Start", "Received"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td className="font-medium">
              <Link href={`/admin/projects/${r.id}`} className="text-blue-700 hover:underline">
                {r.name}
              </Link>
            </Td>
            <Td>
              {r.recipientFirstName} {r.recipientLastName}
            </Td>
            <Td>{r.recipientPhone}</Td>
            <Td>
              <Pill tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Pill>
            </Td>
            <Td>{r.volunteerCount}</Td>
            <Td>{formatDate(r.startDate)}</Td>
            <Td>{formatDate(r.createdAt)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
