"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { contactSchema } from "@/lib/validation/contact";

export type ContactValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
};

export type ContactFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: ContactValues;
};

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function submitContact(_prev: ContactFormState, fd: FormData): Promise<ContactFormState> {
  // Honeypot: real people never see this field. Bots fill it in. Act like it worked.
  if (str(fd, "website") !== "") return { status: "success" };

  const values: ContactValues = {
    firstName: str(fd, "first_name"),
    lastName: str(fd, "last_name"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    message: str(fd, "message"),
  };

  const parsed = contactSchema.safeParse(values);
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
    await db.insert(contactMessages).values({
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone || null,
      email: d.email,
      message: d.message,
    });
  } catch (err) {
    console.error("submitContact failed", err);
    return {
      status: "error",
      message: "Sorry, something went wrong sending your message. Please try again, or call us.",
      values,
    };
  }

  // TODO (phase 3): send the "Incoming Message from Hands & Feet Website" email through SES, and add the Turnstile check above.
  return { status: "success" };
}
