"use server";

import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizations } from "@/db/schema";
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
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: OrgValues;
};

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function submitOrganization(_prev: OrgFormState, fd: FormData): Promise<OrgFormState> {
  // Honeypot: real people never see this field. Bots fill it in. Quietly send them on their way.
  if (str(fd, "website") !== "") redirect("/volunteer");

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
    return { status: "error", message: "Please fix the items marked below.", fieldErrors, values };
  }
  const d = parsed.data;

  let orgId: number;
  try {
    // If an active organization with this name already exists, use it instead of adding a duplicate.
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(and(eq(organizations.active, true), sql`lower(${organizations.name}) = lower(${d.name})`))
      .limit(1);

    if (existing[0]) {
      orgId = existing[0].id;
    } else {
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
        .returning({ id: organizations.id });
      orgId = row.id;
    }
  } catch (err) {
    console.error("submitOrganization failed", err);
    return {
      status: "error",
      message: "Sorry, something went wrong saving the organization. Please try again, or contact us.",
      values,
    };
  }

  // Back to the Volunteer form with the organization already picked (the old site did the same).
  redirect(`/volunteer?org=${orgId}`);
}
