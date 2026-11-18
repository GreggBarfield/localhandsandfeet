"use server";

import { and, count, eq, gte, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { checkHuman, TOO_MANY } from "@/lib/form-guard";
import { organizationSchema } from "@/lib/validation/organization";

export type OrgValues = {
  name: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  type: string;
};

export type OrgFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: OrgValues;
  // Set on success: the organization that was saved (or already existed).
  org?: { id: number; name: string };
};

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

type SaveResult = { ok: true; id: number; name: string } | { ok: false; state: OrgFormState };

// Checks, protects and saves one organization. Shared by the full page and the popup on the Volunteer form.
async function saveOrganization(fd: FormData): Promise<SaveResult> {
  const values: OrgValues = {
    name: str(fd, "org_name"),
    contactFirstName: str(fd, "org_contact_fname"),
    contactLastName: str(fd, "org_contact_lname"),
    contactEmail: str(fd, "org_contact_email"),
    contactPhone: str(fd, "org_contact_phone"),
    type: str(fd, "organization_type"),
  };

  const parsed = organizationSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, state: { status: "error", message: "Please fix the items marked below.", fieldErrors, values } };
  }
  const d = parsed.data;

  const notHuman = await checkHuman(fd);
  if (notHuman) return { ok: false, state: { status: "error", message: notHuman, values } };

  // Flood limit, counted from saved organizations: 10 new ones an hour for the whole form.
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [all] = await db.select({ n: count() }).from(organizations).where(gte(organizations.createdAt, since));
    if (all.n >= 10) return { ok: false, state: { status: "error", message: TOO_MANY, values } };
  } catch (err) {
    console.error("submitOrganization limit check failed", err);
  }

  try {
    // If an active organization with this name already exists, use it instead of adding a duplicate.
    const existing = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(and(eq(organizations.active, true), sql`lower(${organizations.name}) = lower(${d.name})`))
      .limit(1);
    if (existing[0]) return { ok: true, id: existing[0].id, name: existing[0].name };

    const [row] = await db
      .insert(organizations)
      .values({
        name: d.name,
        type: d.type,
        contactFirstName: d.contactFirstName,
        contactLastName: d.contactLastName,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
      })
      .returning({ id: organizations.id, name: organizations.name });
    return { ok: true, id: row.id, name: row.name };
  } catch (err) {
    console.error("submitOrganization failed", err);
    return {
      ok: false,
      state: {
        status: "error",
        message: "Sorry, something went wrong saving the organization. Please try again, or contact us.",
        values,
      },
    };
  }
}

// The full "Add Organization" page. Goes back to the Volunteer form with the organization picked.
export async function submitOrganization(_prev: OrgFormState, fd: FormData): Promise<OrgFormState> {
  // Honeypot: real people never see this field. Bots fill it in. Quietly send them on their way.
  if (str(fd, "website") !== "") redirect("/volunteer");
  const result = await saveOrganization(fd);
  if (!result.ok) return result.state;
  redirect(`/volunteer?org=${result.id}`);
}

// The popup on the Volunteer form. Stays on the page and hands the saved organization back.
export async function submitOrganizationInline(_prev: OrgFormState, fd: FormData): Promise<OrgFormState> {
  if (str(fd, "website") !== "") return { status: "error", message: "Sorry, that could not be saved." };
  const result = await saveOrganization(fd);
  if (!result.ok) return result.state;
  return { status: "success", org: { id: result.id, name: result.name } };
}
