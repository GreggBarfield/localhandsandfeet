import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);

export const ORG_TYPES = [
  { value: "church", label: "Church" },
  { value: "college_campus", label: "College Campus Organization" },
  { value: "high_school_campus", label: "High School Campus Organization" },
  { value: "sports_team", label: "Sports Team" },
] as const;

export const organizationSchema = z.object({
  name: text(200).min(1, "Organization name is required"),
  contactFirstName: text(80).min(1, "First name is required"),
  contactLastName: text(80).min(1, "Last name is required"),
  contactEmail: z.string().trim().toLowerCase().max(200).pipe(z.email("Enter a valid email address")),
  contactPhone: text(40).min(1, "Phone number is required"),
  type: z.enum(["church", "college_campus", "high_school_campus", "sports_team"], {
    error: "Please choose an organization type",
  }),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
