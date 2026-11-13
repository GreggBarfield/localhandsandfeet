"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function setHandledAction(messageId: number, handled: boolean) {
  await requireAdmin();
  await db.update(contactMessages).set({ handled }).where(eq(contactMessages.id, messageId));
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
