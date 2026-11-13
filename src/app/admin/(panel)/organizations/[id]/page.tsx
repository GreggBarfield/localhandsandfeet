import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { organizations, organizationType, volunteers } from "@/db/schema";
import { formatDate } from "@/components/admin/data-table";
import { OrgForm } from "./org-form";

export default async function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  if (!org) notFound();

  const members = await db
    .select({ id: volunteers.id, firstName: volunteers.firstName, lastName: volunteers.lastName, email: volunteers.email })
    .from(volunteers)
    .where(eq(volunteers.organizationId, id))
    .orderBy(asc(volunteers.lastName), asc(volunteers.firstName));

  return (
    <>
      <Link href="/admin/organizations" className="text-sm text-muted-foreground hover:underline">
        &larr; All organizations
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <span className="text-sm text-muted-foreground">Added {formatDate(org.createdAt)}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <OrgForm
          organizationId={org.id}
          types={organizationType.enumValues}
          values={{
            name: org.name,
            type: org.type,
            contactFirstName: org.contactFirstName,
            contactLastName: org.contactLastName,
            contactEmail: org.contactEmail,
            contactPhone: org.contactPhone,
            active: org.active,
          }}
        />

        <section className="h-fit rounded-lg border border-border bg-white p-5">
          <h2 className="text-lg font-bold">Volunteers ({members.length})</h2>
          <ul className="mt-4 divide-y divide-border">
            {members.length === 0 && <li className="py-3 text-sm text-muted-foreground">No volunteers from this organization yet.</li>}
            {members.map((m) => (
              <li key={m.id} className="py-3 text-sm">
                <Link href={`/admin/volunteers/${m.id}`} className="font-medium text-blue-700 hover:underline">
                  {m.firstName} {m.lastName}
                </Link>
                <p className="text-muted-foreground">{m.email}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
