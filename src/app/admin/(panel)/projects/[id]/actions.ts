"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectStatus, projectVolunteers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export type SaveState = { error?: string; saved?: boolean };

const text = (label: string) => z.string().trim().min(1, `${label} is required`);
const optional = z.string().trim().transform((v) => v || null);
const dateOrNull = z
  .string()
  .trim()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Dates must be real dates");

const schema = z.object({
  name: text("Project name"),
  status: z.enum(projectStatus.enumValues),
  recipientFirstName: text("Recipient first name"),
  recipientLastName: text("Recipient last name"),
  recipientAddress: text("Recipient address"),
  recipientCityStateZip: text("Recipient city, state, zip"),
  recipientEmail: optional,
  recipientPhone: text("Recipient phone"),
  requesterSameAsRecipient: z.boolean(),
  requesterFirstName: optional,
  requesterLastName: optional,
  requesterEmail: optional,
  requesterPhone: optional,
  description: text("Description"),
  startDate: dateOrNull,
  endDate: dateOrNull,
  adminNotes: optional,
});

export async function updateProjectAction(projectId: number, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();

  const get = (k: string) => String(formData.get(k) ?? "");
  const parsed = schema.safeParse({
    name: get("name"),
    status: get("status"),
    recipientFirstName: get("recipientFirstName"),
    recipientLastName: get("recipientLastName"),
    recipientAddress: get("recipientAddress"),
    recipientCityStateZip: get("recipientCityStateZip"),
    recipientEmail: get("recipientEmail"),
    recipientPhone: get("recipientPhone"),
    requesterSameAsRecipient: formData.get("requesterSameAsRecipient") === "on",
    requesterFirstName: get("requesterFirstName"),
    requesterLastName: get("requesterLastName"),
    requesterEmail: get("requesterEmail"),
    requesterPhone: get("requesterPhone"),
    description: get("description"),
    startDate: get("startDate"),
    endDate: get("endDate"),
    adminNotes: get("adminNotes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  const v = parsed.data;
  if (v.startDate && v.endDate && v.endDate < v.startDate) return { error: "End date is before the start date." };

  await db
    .update(projects)
    .set({
      ...v,
      // When "same as recipient" is checked, the requester fields are not kept.
      requesterFirstName: v.requesterSameAsRecipient ? null : v.requesterFirstName,
      requesterLastName: v.requesterSameAsRecipient ? null : v.requesterLastName,
      requesterEmail: v.requesterSameAsRecipient ? null : v.requesterEmail,
      requesterPhone: v.requesterSameAsRecipient ? null : v.requesterPhone,
    })
    .where(eq(projects.id, projectId));

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
  return { saved: true };
}

export async function assignVolunteerAction(projectId: number, formData: FormData) {
  await requireAdmin();
  const volunteerId = Number(formData.get("volunteerId"));
  if (!Number.isInteger(volunteerId) || volunteerId <= 0) return;
  const role = String(formData.get("role") ?? "").trim() || null;
  await db.insert(projectVolunteers).values({ projectId, volunteerId, role }).onConflictDoNothing();
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}

export async function removeVolunteerAction(projectId: number, volunteerId: number) {
  await requireAdmin();
  await db
    .delete(projectVolunteers)
    .where(and(eq(projectVolunteers.projectId, projectId), eq(projectVolunteers.volunteerId, volunteerId)));
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
}
