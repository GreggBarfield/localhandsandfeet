import { desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { organizations, volunteers } from "@/db/schema";
import Link from "next/link";
import { ExportButton, formatDate, PageHeader, SearchBox, Table, Td } from "@/components/admin/data-table";

export default async function VolunteersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const like = `%${q}%`;
  const rows = await db
    .select({
      id: volunteers.id,
      firstName: volunteers.firstName,
      lastName: volunteers.lastName,
      email: volunteers.email,
      phone: volunteers.phone,
      organization: organizations.name,
      createdAt: volunteers.createdAt,
    })
    .from(volunteers)
    .leftJoin(organizations, eq(volunteers.organizationId, organizations.id))
    .where(
      q
        ? or(ilike(volunteers.firstName, like), ilike(volunteers.lastName, like), ilike(volunteers.email, like), ilike(organizations.name, like))
        : undefined,
    )
    .orderBy(desc(volunteers.createdAt));

  return (
    <>
      <PageHeader title="Volunteers" count={rows.length}>
        <ExportButton kind="volunteers" />
      </PageHeader>
      <SearchBox q={q} placeholder="Search name, email, or organization" />
      <Table headers={["Name", "Organization", "Email", "Phone", "Signed up"]} empty={rows.length === 0}>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td className="font-medium">
              <Link href={`/admin/volunteers/${r.id}`} className="text-blue-700 hover:underline">
                {r.firstName} {r.lastName}
              </Link>
            </Td>
            <Td>{r.organization ?? ""}</Td>
            <Td>{r.email}</Td>
            <Td>{r.phone ?? ""}</Td>
            <Td>{formatDate(r.createdAt)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
