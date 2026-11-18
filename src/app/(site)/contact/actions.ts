"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { checkHuman, countLinks, LINKS_MESSAGE, TOO_MANY } from "@/lib/form-guard";
import { sendMail } from "@/lib/mail";
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

  if (countLinks(d.message) > 2) {
    return {
      status: "error",
      message: "Please fix the items marked below.",
      fieldErrors: { message: LINKS_MESSAGE },
      values,
    };
  }

  const notHuman = await checkHuman(fd);
  if (notHuman) return { status: "error", message: notHuman, values };

  // Flood limits, counted from the saved messages: 30 an hour for the whole form, 3 an hour per email address.
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [all] = await db.select({ n: count() }).from(contactMessages).where(gte(contactMessages.createdAt, since));
    const [mine] = await db
      .select({ n: count() })
      .from(contactMessages)
      .where(and(gte(contactMessages.createdAt, since), eq(contactMessages.email, d.email)));
    if (all.n >= 30 || mine.n >= 3) {
      return {
        status: "error",
        message: TOO_MANY,
        values,
      };
    }
  } catch (err) {
    console.error("submitContact limit check failed", err);
  }

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

  // The message is saved, so a mail problem only gets logged. The person still sees success.
  await sendMail({
    subject: "Incoming Message from Hands & Feet Website",
    replyTo: d.email,
    text: [
      `Name: ${d.firstName} ${d.lastName}`,
      `Email: ${d.email}`,
      `Phone: ${d.phone || "(none given)"}`,
      "",
      d.message,
    ].join("\n"),
  });

  return { status: "success" };
}
