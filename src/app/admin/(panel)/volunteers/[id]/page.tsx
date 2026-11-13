import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { organizations, projects, projectVolunteers, volunteerFamilyMembers, volunteers } from "@/db/schema";
import { formatDate, Pill, STATUS_LABELS, STATUS_TONES } from "@/components/admin/data-table";
import { addFamilyMemberAction, removeFamilyMemberAction } from "./actions";
import { VolunteerForm } from "./volunteer-form";

export default async function VolunteerPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [volunteer] = await db.select().from(volunteers).where(eq(volunteers.id, id)).limit(1);
  if (!volunteer) notFound();

  const [orgs, family, theirProjects] = await Promise.all([
    db.select({ id: organizations.id, name: organizations.name }).from(organizations).orderBy(asc(organizations.name)),
    db.select().from(volunteerFamilyMembers).where(eq(volunteerFamilyMembers.volunteerId, id)).orderBy(asc(volunteerFamilyMembers.id)),
    db
      .select({ id: projects.id, name: projects.name, status: projects.status, role: projectVolunteers.role })
      .from(projectVolunteers)
      .innerJoin(projects, eq(projectVolunteers.projectId, projects.id))
      .where(eq(projectVolunteers.volunteerId, id))
      .orderBy(asc(projects.id)),
  ]);

  const inputClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

  return (
    <>
      <Link href="/admin/volunteers" className="text-sm text-muted-foreground hover:underline">
        &larr; All volunteers
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-bold">
          {volunteer.firstName} {volunteer.lastName}
        </h1>
        <span className="text-sm text-muted-foreground">Signed up {formatDate(volunteer.createdAt)}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <VolunteerForm
          volunteerId={volunteer.id}
          values={{
            firstName: volunteer.firstName,
            lastName: volunteer.lastName,
            email: volunteer.email,
            phone: volunteer.phone,
            dateOfBirth: volunteer.dateOfBirth,
            isEighteenOrOlder: volunteer.isEighteenOrOlder,
            organizationId: volunteer.organizationId,
            notes: volunteer.notes,
            adminNotes: volunteer.adminNotes,
            wantsFamilyListed: volunteer.wantsFamilyListed,
            seekingChurchHome: volunteer.seekingChurchHome,
          }}
          organizations={orgs}
        />

        <div className="grid h-fit gap-8">
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-lg font-bold">Family members ({family.length})</h2>
            <ul className="mt-4 divide-y divide-border">
              {family.length === 0 && <li className="py-3 text-sm text-muted-foreground">None listed.</li>}
              {family.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {f.firstName} {f.lastName}
                    </p>
                    {f.dateOfBirth && <p className="text-muted-foreground">Born {formatDate(f.dateOfBirth)}</p>}
                  </div>
                  <form action={removeFamilyMemberAction.bind(null, volunteer.id, f.id)}>
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <form action={addFamilyMemberAction.bind(null, volunteer.id)} className="mt-4 grid gap-3 border-t border-border pt-4">
              <p className="text-sm font-medium">Add a family member</p>
              <input name="firstName" placeholder="First name" required className={inputClass} aria-label="Family member first name" />
              <input name="lastName" placeholder="Last name" required className={inputClass} aria-label="Family member last name" />
              <input name="dateOfBirth" type="date" className={inputClass} aria-label="Family member date of birth" />
              <button type="submit" className="h-10 rounded-md bg-zinc-900 text-sm text-white hover:bg-zinc-700">
                Add family member
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-lg font-bold">Projects ({theirProjects.length})</h2>
            <ul className="mt-4 divide-y divide-border">
              {theirProjects.length === 0 && <li className="py-3 text-sm text-muted-foreground">Not assigned to any project.</li>}
              {theirProjects.map((p) => (
                <li key={p.id} className="py-3 text-sm">
                  <Link href={`/admin/projects/${p.id}`} className="font-medium text-blue-700 hover:underline">
                    {p.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <Pill tone={STATUS_TONES[p.status]}>{STATUS_LABELS[p.status]}</Pill>
                    {p.role && <span className="text-xs text-muted-foreground">{p.role}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
