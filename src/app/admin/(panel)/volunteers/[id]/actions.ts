"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { volunteerFamilyMembers, volunteers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { isUniqueViolation } from "@/lib/db-errors";

export type SaveState = { error?: string; saved?: boolean };

const text = (label: string) => z.string().trim().min(1, `${label} is required`);
const optional = z.string().trim().transform((v) => v || null);
const dateOrNull = z
  .string()
  .trim()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Dates must be real dates");

const schema = z.object({
  firstName: text("First name"),
  lastName: text("Last name"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  phone: optional,
  dateOfBirth: dateOrNull,
  isEighteenOrOlder: z.boolean(),
  organizationId: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || Number.isInteger(v), "Pick an organization from the list"),
  notes: optional,
  adminNotes: optional,
  wantsFamilyListed: z.boolean(),
  seekingChurchHome: z.boolean(),
});

export async function updateVolunteerAction(volunteerId: number, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "");
  const on = (k: string) => formData.get(k) === "on";

  const parsed = schema.safeParse({
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    phone: get("phone"),
    dateOfBirth: get("dateOfBirth"),
    isEighteenOrOlder: on("isEighteenOrOlder"),
    organizationId: get("organizationId"),
    notes: get("notes"),
    adminNotes: get("adminNotes"),
    wantsFamilyListed: on("wantsFamilyListed"),
    seekingChurchHome: on("seekingChurchHome"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  try {
    await db.update(volunteers).set(parsed.data).where(eq(volunteers.id, volunteerId));
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Another volunteer already uses that email." };
    throw e;
  }

  revalidatePath("/admin/volunteers");
  revalidatePath(`/admin/volunteers/${volunteerId}`);
  return { saved: true };
}

const familySchema = z.object({
  firstName: text("Family member first name"),
  lastName: text("Family member last name"),
  dateOfBirth: dateOrNull,
});

export async function addFamilyMemberAction(volunteerId: number, formData: FormData) {
  await requireAdmin();
  const parsed = familySchema.safeParse({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
  });
  if (!parsed.success) return;
  await db.insert(volunteerFamilyMembers).values({ volunteerId, ...parsed.data });
  revalidatePath(`/admin/volunteers/${volunteerId}`);
}

export async function removeFamilyMemberAction(volunteerId: number, familyMemberId: number) {
  await requireAdmin();
  // Matching on the volunteer too, so a stray id can't delete someone else's family member.
  await db
    .delete(volunteerFamilyMembers)
    .where(and(eq(volunteerFamilyMembers.id, familyMemberId), eq(volunteerFamilyMembers.volunteerId, volunteerId)));
  revalidatePath(`/admin/volunteers/${volunteerId}`);
}
