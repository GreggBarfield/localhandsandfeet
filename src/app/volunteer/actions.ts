"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { volunteerFamilyMembers, volunteers } from "@/db/schema";
import { volunteerSchema } from "@/lib/validation/volunteer";

export type FamilyValues = { firstName: string; lastName: string; dateOfBirth: string };

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isEighteenOrOlder: string;
  inOrganization: string;
  organizationId: string;
  notes: string;
  wantsFamilyListed: boolean;
  seekingChurchHome: boolean;
  family: FamilyValues[];
};

export type VolunteerFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: FormValues;
  firstName?: string;
};

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function submitVolunteer(
  _prev: VolunteerFormState,
  fd: FormData,
): Promise<VolunteerFormState> {
  // Honeypot: real people never see this field. Bots fill it in. Act like it worked.
  if (str(fd, "website") !== "") return { status: "success", firstName: "friend" };

  const wantsFamilyListed = fd.get("includeFamily") === "on";
  const firsts = fd.getAll("family_first").map(String);
  const lasts = fd.getAll("family_last").map(String);
  const dobs = fd.getAll("family_dob").map(String);
  const family: FamilyValues[] = firsts
    .map((_, i) => ({
      firstName: (firsts[i] ?? "").trim(),
      lastName: (lasts[i] ?? "").trim(),
      dateOfBirth: (dobs[i] ?? "").trim(),
    }))
    .filter((m) => m.firstName || m.lastName || m.dateOfBirth);

  const values: FormValues = {
    firstName: str(fd, "vol_fname"),
    lastName: str(fd, "vol_lname"),
    email: str(fd, "vol_email"),
    phone: str(fd, "vol_phone"),
    isEighteenOrOlder: str(fd, "eighteen_yn"),
    inOrganization: str(fd, "organization_yn"),
    organizationId: str(fd, "organization_name"),
    notes: str(fd, "volunteer_proj_notes"),
    wantsFamilyListed,
    seekingChurchHome: fd.get("church_home") === "Y",
    family: wantsFamilyListed ? family : [],
  };

  const parsed = volunteerSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the items marked below.", fieldErrors, values };
  }
  const d = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: volunteers.id, adminNotes: volunteers.adminNotes })
        .from(volunteers)
        .where(eq(volunteers.email, d.email))
        .limit(1);

      let volunteerId: number;
      if (existing[0]) {
        // Same email signed up before. Leave their record alone and log the new sign-up for the admins.
        volunteerId = existing[0].id;
        const stamp = new Date().toISOString().slice(0, 10);
        const line = `[${stamp}] Signed up again on the website.${d.notes ? ` Notes: ${d.notes}` : ""}`;
        await tx
          .update(volunteers)
          .set({ adminNotes: existing[0].adminNotes ? `${existing[0].adminNotes}\n${line}` : line })
          .where(eq(volunteers.id, volunteerId));
      } else {
        const [row] = await tx
          .insert(volunteers)
          .values({
            firstName: d.firstName,
            lastName: d.lastName,
            email: d.email,
            phone: d.phone || null,
            isEighteenOrOlder: d.isEighteenOrOlder === "Y",
            organizationId: d.inOrganization === "Y" ? Number(d.organizationId) : null,
            notes: d.notes || null,
            wantsFamilyListed: d.wantsFamilyListed,
            seekingChurchHome: d.seekingChurchHome,
          })
          .returning({ id: volunteers.id });
        volunteerId = row.id;
      }

      if (d.family.length > 0) {
        await tx.insert(volunteerFamilyMembers).values(
          d.family.map((m) => ({
            volunteerId,
            firstName: m.firstName,
            lastName: m.lastName,
            dateOfBirth: m.dateOfBirth,
          })),
        );
      }
    });
  } catch (err) {
    console.error("submitVolunteer failed", err);
    return {
      status: "error",
      message: "Sorry, something went wrong saving your information. Please try again, or contact us.",
      values,
    };
  }

  // TODO (phase 3): send the notification email through SES, and add the Turnstile check above.
  return { status: "success", firstName: d.firstName };
}
