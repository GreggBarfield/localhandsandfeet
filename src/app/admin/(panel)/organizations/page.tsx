import { asc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import Link from "next/link";
import { ExportButton, ORG_TYPE_LABELS, PageHeader, Pill, SearchBox, Table, Td } from "@/components/admin/data-table";

export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const like = `%${q}%`;
  const rows = await db
    .select()
    .from(organizations)
    .where(
      q
        ? or(
            ilike(organizations.name, like),
            ilike(organizations.contactFirstName, like),
            ilike(organizations.contactLastName, like),
            ilike(organizations.contactEmail, like),
          )
        : undefined,
    )
    .orderBy(asc(organizations.name));

  return (
    <>
      <PageHeader title="Organizations" count={rows.length}>
        <ExportButton kind="organizations" />
      </PageHeader>
      <SearchBox q={q} placeholder="Search organization, contact, or email" />
      <Table headers={["Organization", "Type", "Contact", "Email", "Phone", "Status"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td className="font-medium">
              <Link href={`/admin/organizations/${r.id}`} className="text-blue-700 hover:underline">
                {r.name}
              </Link>
            </Td>
            <Td>{ORG_TYPE_LABELS[r.type]}</Td>
            <Td>
              {r.contactFirstName} {r.contactLastName}
            </Td>
            <Td>{r.contactEmail}</Td>
            <Td>{r.contactPhone}</Td>
            <Td>{r.active ? <Pill tone="green">Active</Pill> : <Pill>Inactive</Pill>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
