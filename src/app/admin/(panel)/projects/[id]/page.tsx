import { asc, eq, notInArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, projectStatus, projectVolunteers, volunteers } from "@/db/schema";
import { formatDate, Pill, STATUS_LABELS, STATUS_TONES } from "@/components/admin/data-table";
import { assignVolunteerAction, removeVolunteerAction } from "./actions";
import { ProjectForm } from "./project-form";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();

  const assigned = await db
    .select({
      id: volunteers.id,
      firstName: volunteers.firstName,
      lastName: volunteers.lastName,
      email: volunteers.email,
      phone: volunteers.phone,
      role: projectVolunteers.role,
    })
    .from(projectVolunteers)
    .innerJoin(volunteers, eq(projectVolunteers.volunteerId, volunteers.id))
    .where(eq(projectVolunteers.projectId, id))
    .orderBy(asc(volunteers.lastName), asc(volunteers.firstName));

  const assignedIds = assigned.map((a) => a.id);
  const available = await db
    .select({ id: volunteers.id, firstName: volunteers.firstName, lastName: volunteers.lastName })
    .from(volunteers)
    .where(assignedIds.length ? notInArray(volunteers.id, assignedIds) : undefined)
    .orderBy(asc(volunteers.lastName), asc(volunteers.firstName));

  return (
    <>
      <Link href="/admin/projects" className="text-sm text-muted-foreground hover:underline">
        &larr; All projects
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <Pill tone={STATUS_TONES[project.status]}>{STATUS_LABELS[project.status]}</Pill>
        <span className="text-sm text-muted-foreground">Received {formatDate(project.createdAt)}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <ProjectForm projectId={project.id} statuses={projectStatus.enumValues} values={project} />

        <section className="h-fit rounded-lg border border-border bg-white p-5">
          <h2 className="text-lg font-bold">Volunteers ({assigned.length})</h2>

          <ul className="mt-4 divide-y divide-border">
            {assigned.length === 0 && <li className="py-3 text-sm text-muted-foreground">No one assigned yet.</li>}
            {assigned.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-muted-foreground">{a.email}</p>
                  {a.phone && <p className="text-muted-foreground">{a.phone}</p>}
                  {a.role && <p className="mt-1 text-xs">Role: {a.role}</p>}
                </div>
                <form action={removeVolunteerAction.bind(null, project.id, a.id)}>
                  <button type="submit" className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <form action={assignVolunteerAction.bind(null, project.id)} className="mt-4 grid gap-3 border-t border-border pt-4">
            <label htmlFor="volunteerId" className="text-sm font-medium">
              Add a volunteer
            </label>
            <select id="volunteerId" name="volunteerId" required defaultValue="" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="" disabled>
                {available.length ? "Choose a volunteer..." : "No volunteers available"}
              </option>
              {available.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.lastName}, {v.firstName}
                </option>
              ))}
            </select>
            <input name="role" placeholder="Role (optional, like Team lead)" className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
            <button type="submit" className="h-10 rounded-md bg-zinc-900 text-sm text-white hover:bg-zinc-700">
              Add to project
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
