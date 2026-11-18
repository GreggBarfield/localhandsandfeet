"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { organizations, organizationType } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export type SaveState = { error?: string; saved?: boolean };

const text = (label: string) => z.string().trim().min(1, `${label} is required`);

const schema = z.object({
  name: text("Organization name"),
  type: z.enum(organizationType.enumValues),
  // Organizations imported from the old site have no contact person, so these may be blank.
  contactFirstName: z.string().trim(),
  contactLastName: z.string().trim(),
  contactEmail: z.string().trim().toLowerCase().refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid contact email"),
  contactPhone: z.string().trim(),
  active: z.boolean(),
});

export async function updateOrganizationAction(organizationId: number, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "");
  const parsed = schema.safeParse({
    name: get("name"),
    type: get("type"),
    contactFirstName: get("contactFirstName"),
    contactLastName: get("contactLastName"),
    contactEmail: get("contactEmail"),
    contactPhone: get("contactPhone"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  await db.update(organizations).set(parsed.data).where(eq(organizations.id, organizationId));

  revalidatePath("/admin/organizations");
  revalidatePath(`/admin/organizations/${organizationId}`);
  return { saved: true };
}
