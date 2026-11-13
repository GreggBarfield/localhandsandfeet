"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { askForHelpSchema } from "@/lib/validation/ask-for-help";

export type AskValues = {
  recipientFirstName: string;
  recipientLastName: string;
  recipientAddress: string;
  recipientCityStateZip: string;
  recipientEmail: string;
  recipientPhone: string;
  requesterSameAsRecipient: boolean;
  requesterFirstName: string;
  requesterLastName: string;
  requesterEmail: string;
  requesterPhone: string;
  description: string;
};

export type AskFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: AskValues;
  firstName?: string;
};

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function submitAskForHelp(_prev: AskFormState, fd: FormData): Promise<AskFormState> {
  // Honeypot: real people never see this field. Bots fill it in. Act like it worked.
  if (str(fd, "website") !== "") return { status: "success", firstName: "friend" };

  const values: AskValues = {
    recipientFirstName: str(fd, "ask_rec_fname"),
    recipientLastName: str(fd, "ask_rec_lname"),
    recipientAddress: str(fd, "ask_rec_address"),
    recipientCityStateZip: str(fd, "ask_rec_city"),
    recipientEmail: str(fd, "ask_rec_email"),
    recipientPhone: str(fd, "ask_rec_phone"),
    requesterSameAsRecipient: fd.get("homepostalcheck") === "Y",
    requesterFirstName: str(fd, "ask_your_fname"),
    requesterLastName: str(fd, "ask_your_lname"),
    requesterEmail: str(fd, "ask_your_email"),
    requesterPhone: str(fd, "ask_your_phone"),
    description: str(fd, "ask_proj_description"),
  };

  const parsed = askForHelpSchema.safeParse(values);
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
    const today = new Date().toISOString().slice(0, 10);
    await db.insert(projects).values({
      // Admins can rename it. The status starts as "new", which replaces the old "Under Review <date>" names.
      name: `Request - ${d.recipientLastName} - ${today}`,
      status: "new",
      recipientFirstName: d.recipientFirstName,
      recipientLastName: d.recipientLastName,
      recipientAddress: d.recipientAddress,
      recipientCityStateZip: d.recipientCityStateZip,
      recipientEmail: d.recipientEmail || null,
      recipientPhone: d.recipientPhone,
      requesterSameAsRecipient: d.requesterSameAsRecipient,
      requesterFirstName: d.requesterFirstName,
      requesterLastName: d.requesterLastName,
      requesterEmail: d.requesterEmail,
      requesterPhone: d.requesterPhone,
      description: d.description,
    });
  } catch (err) {
    console.error("submitAskForHelp failed", err);
    return {
      status: "error",
      message: "Sorry, something went wrong saving your request. Please try again, or contact us.",
      values,
    };
  }

  // TODO (phase 3): send the "New Project from Hands & Feet Website" email through SES, and add the Turnstile check above.
  return { status: "success", firstName: d.requesterFirstName };
}
