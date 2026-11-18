import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);

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
    familyMinorsCount: z.string().trim(),
  })
  .superRefine((d, ctx) => {
    if (d.inOrganization === "Y" && !/^\d+$/.test(d.organizationId)) {
      ctx.addIssue({ code: "custom", path: ["organizationId"], message: "Choose your organization" });
    }
    if (d.wantsFamilyListed) {
      const n = Number(d.familyMinorsCount);
      if (d.familyMinorsCount === "" || !Number.isInteger(n) || n < 0 || n > 50) {
        ctx.addIssue({
          code: "custom",
          path: ["familyMinorsCount"],
          message: "Enter a number from 0 to 50 (use 0 if none are under 18)",
        });
      }
    }
  });

export type VolunteerInput = z.infer<typeof volunteerSchema>;
