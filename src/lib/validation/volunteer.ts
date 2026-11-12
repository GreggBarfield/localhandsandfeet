import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);

export const familyMemberSchema = z.object({
  firstName: text(80).min(1, "First name is required"),
  lastName: text(80).min(1, "Last name is required"),
  dateOfBirth: z
    .union([z.literal(""), z.iso.date("Enter a valid date")])
    .transform((v) => (v === "" ? null : v)),
});

export const volunteerSchema = z
  .object({
    firstName: text(80).min(1, "First name is required"),
    lastName: text(80).min(1, "Last name is required"),
    email: z.string().trim().toLowerCase().max(200).pipe(z.email("Enter a valid email address")),
    phone: text(40),
    isEighteenOrOlder: z.enum(["Y", "N"], { error: "Please choose Yes or No" }),
    inOrganization: z.enum(["Y", "N"], { error: "Please choose Yes or No" }),
    organizationId: z.string().trim(),
    notes: text(2000),
    wantsFamilyListed: z.boolean(),
    seekingChurchHome: z.boolean(),
    family: z.array(familyMemberSchema).max(20, "Please list up to 20 family members"),
  })
  .superRefine((d, ctx) => {
    if (d.inOrganization === "Y" && !/^\d+$/.test(d.organizationId)) {
      ctx.addIssue({ code: "custom", path: ["organizationId"], message: "Choose your organization" });
    }
  });

export type VolunteerInput = z.infer<typeof volunteerSchema>;
