"use server";

import { count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { organizations, volunteers } from "@/db/schema";
import { sendMail, questionsAndAnswers } from "@/lib/mail";
import { checkHuman, countLinks, LINKS_MESSAGE, TOO_MANY } from "@/lib/form-guard";
import { volunteerSchema } from "@/lib/validation/volunteer";

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
  familyMinorsCount: string;
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
    familyMinorsCount: wantsFamilyListed ? str(fd, "family_minors") : "",
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
  const minors = d.wantsFamilyListed ? Number(d.familyMinorsCount) : null;

  if (countLinks(d.notes) > 2) {
    return {
      status: "error",
      message: "Please fix the items marked below.",
      fieldErrors: { notes: LINKS_MESSAGE },
      values,
    };
  }

  const notHuman = await checkHuman(fd);
  if (notHuman) return { status: "error", message: notHuman, values };

  // Flood limit, counted from saved volunteers: 30 new sign-ups an hour for the whole form.
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [all] = await db.select({ n: count() }).from(volunteers).where(gte(volunteers.createdAt, since));
    if (all.n >= 30) return { status: "error", message: TOO_MANY, values };
  } catch (err) {
    console.error("submitVolunteer limit check failed", err);
  }

  let isRepeat = false;
  let notifyAdmin = true;
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
        isRepeat = true;
        const stamp = new Date().toISOString().slice(0, 10);
        const familyBit = minors === null ? "" : ` Signing up with family, ${minors} under 18.`;
        const line = `[${stamp}] Signed up again on the website.${familyBit}${d.notes ? ` Notes: ${d.notes}` : ""}`;
        // Only one "signed up again" line per day, so repeated posts cannot pile up notes.
        // A same-day repeat is also not emailed again.
        if (existing[0].adminNotes?.includes(`[${stamp}] Signed up again`)) {
          notifyAdmin = false;
        } else {
          await tx
            .update(volunteers)
            .set({ adminNotes: existing[0].adminNotes ? `${existing[0].adminNotes}\n${line}` : line })
            .where(eq(volunteers.id, volunteerId));
        }
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
            familyMinorsCount: minors,
            seekingChurchHome: d.seekingChurchHome,
          })
          .returning({ id: volunteers.id });
        volunteerId = row.id;
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

  if (notifyAdmin) {
    // The sign-up is saved, so a mail problem only gets logged. The person still sees success.
    let orgName = "";
    if (d.inOrganization === "Y") {
      try {
        const [o] = await db
          .select({ name: organizations.name })
          .from(organizations)
          .where(eq(organizations.id, Number(d.organizationId)))
          .limit(1);
        orgName = o?.name ?? "";
      } catch (err) {
        console.error("submitVolunteer could not look up the organization name", err);
      }
    }
    await sendMail({
      subject: "New Volunteer from Hands & Feet Website",
      replyTo: d.email,
      text:
        (isRepeat ? "This person has signed up before. Their existing record was kept and a note was added.\n\n" : "") +
        questionsAndAnswers([
          ["First Name", d.firstName],
          ["Last Name", d.lastName],
          ["Phone Number", d.phone],
          ["Email Address", d.email],
          ["Are you 18 or Older?", d.isEighteenOrOlder === "Y" ? "Yes" : "No"],
          ["Are you part of an organization?", d.inOrganization === "Y" ? "Yes" : "No"],
          ["Organization", orgName],
          ["Enter any notes here (Skills? What you want or don't want to do?)", d.notes],
          ["I want to add family members.", d.wantsFamilyListed ? "Yes" : "No"],
          ...(minors === null ? [] : ([["How many of them are under 18?", String(minors)]] as [string, string][])),
          ["I'm looking for a church home.", d.seekingChurchHome ? "Yes" : "No"],
        ]),
    });
  }

  return { status: "success", firstName: d.firstName };
}
