import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, organizations, projects, volunteers } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

const KINDS = ["volunteers", "projects", "organizations", "messages"] as const;

// Admin-only CSV downloads. Signed-out visitors get a 401 and no data.
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await getAdmin())) return new Response("Not signed in", { status: 401 });

  const { kind } = await params;
  let csv: string;

  if (kind === "volunteers") {
    const rows = await db
      .select({
        v: volunteers,
        organization: organizations.name,
        family: sql<string | null>`(select string_agg(f.first_name || ' ' || f.last_name, '; ' order by f.id) from volunteer_family_members f where f.volunteer_id = ${volunteers.id})`,
      })
      .from(volunteers)
      .leftJoin(organizations, eq(volunteers.organizationId, organizations.id))
      .orderBy(asc(volunteers.lastName), asc(volunteers.firstName));
    csv = toCsv(
      ["First name", "Last name", "Email", "Phone", "Date of birth", "18 or older", "Organization", "Wants family listed", "Family under 18", "Seeking church home", "Family members", "Volunteer comments", "Admin notes", "Signed up"],
      rows.map(({ v, organization, family }) => [v.firstName, v.lastName, v.email, v.phone, v.dateOfBirth, v.isEighteenOrOlder ? "Yes" : "No", organization, v.wantsFamilyListed ? "Yes" : "No", v.familyMinorsCount, v.seekingChurchHome ? "Yes" : "No", family, v.notes, v.adminNotes, v.createdAt]),
    );
  } else if (kind === "projects") {
    const rows = await db
      .select({
        p: projects,
        volunteerNames: sql<string | null>`(select string_agg(v.first_name || ' ' || v.last_name, '; ' order by v.last_name, v.first_name) from project_volunteers pv join volunteers v on v.id = pv.volunteer_id where pv.project_id = ${projects.id})`,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt));
    csv = toCsv(
      ["Project", "Status", "Start date", "End date", "Recipient first name", "Recipient last name", "Recipient address", "Recipient city, state, zip", "Recipient phone", "Recipient email", "Requester same as recipient", "Requester first name", "Requester last name", "Requester phone", "Requester email", "Description", "Volunteers", "Admin notes", "Received"],
      rows.map(({ p, volunteerNames }) => [p.name, p.status, p.startDate, p.endDate, p.recipientFirstName, p.recipientLastName, p.recipientAddress, p.recipientCityStateZip, p.recipientPhone, p.recipientEmail, p.requesterSameAsRecipient ? "Yes" : "No", p.requesterFirstName, p.requesterLastName, p.requesterPhone, p.requesterEmail, p.description, volunteerNames, p.adminNotes, p.createdAt]),
    );
  } else if (kind === "organizations") {
    const rows = await db.select().from(organizations).orderBy(asc(organizations.name));
    csv = toCsv(
      ["Organization", "Type", "Contact first name", "Contact last name", "Contact email", "Contact phone", "Active", "Added"],
      rows.map((o) => [o.name, o.type, o.contactFirstName, o.contactLastName, o.contactEmail, o.contactPhone, o.active ? "Yes" : "No", o.createdAt]),
    );
  } else if (kind === "messages") {
    const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    csv = toCsv(
      ["First name", "Last name", "Email", "Phone", "Message", "Handled", "Received"],
      rows.map((m) => [m.firstName, m.lastName, m.email, m.phone, m.message, m.handled ? "Yes" : "No", m.createdAt]),
    );
  } else {
    return new Response(`Unknown export. Use one of: ${KINDS.join(", ")}`, { status: 404 });
  }

  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind}-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
