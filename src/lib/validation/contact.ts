import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);

export const contactSchema = z.object({
  firstName: text(80).min(1, "First name is required"),
  lastName: text(80).min(1, "Last name is required"),
  phone: text(40),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("Enter a valid email address")),
  message: text(5000).min(1, "Please enter a message"),
});

export type ContactInput = z.infer<typeof contactSchema>;
