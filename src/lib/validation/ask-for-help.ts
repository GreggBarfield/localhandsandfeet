import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const required = (max: number, label: string) => text(max).min(1, `${label} is required`);
const email = z.string().trim().toLowerCase().max(200).pipe(z.email("Enter a valid email address"));

export const askForHelpSchema = z.object({
  recipientFirstName: required(80, "First name"),
  recipientLastName: required(80, "Last name"),
  recipientAddress: required(200, "Address"),
  recipientCityStateZip: required(120, "City, state and zip"),
  recipientEmail: z.union([z.literal(""), email]),
  recipientPhone: required(40, "Phone number"),
  requesterSameAsRecipient: z.boolean(),
  requesterFirstName: required(80, "First name"),
  requesterLastName: required(80, "Last name"),
  requesterEmail: email,
  requesterPhone: required(40, "Phone number"),
  description: required(4000, "Please describe the project"),
});

export type AskForHelpInput = z.infer<typeof askForHelpSchema>;
