import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const organizationType = pgEnum("organization_type", [
  "church",
  "college_campus",
  "high_school_campus",
  "sports_team",
]);

export const projectStatus = pgEnum("project_status", [
  "new",
  "under_review",
  "approved",
  "scheduled",
  "in_progress",
  "completed",
  "declined",
]);

export const donationType = pgEnum("donation_type", ["one_time", "recurring"]);

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: organizationType("type").notNull(),
  contactFirstName: text("contact_first_name").notNull(),
  contactLastName: text("contact_last_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  isEighteenOrOlder: boolean("is_18_or_older").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  wantsFamilyListed: boolean("wants_family_listed").notNull().default(false),
  seekingChurchHome: boolean("seeking_church_home").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: projectStatus("status").notNull().default("new"),
  recipientFirstName: text("recipient_first_name").notNull(),
  recipientLastName: text("recipient_last_name").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  recipientCityStateZip: text("recipient_city_state_zip").notNull(),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone").notNull(),
  requesterSameAsRecipient: boolean("requester_same_as_recipient").notNull().default(false),
  requesterFirstName: text("requester_first_name"),
  requesterLastName: text("requester_last_name"),
  requesterEmail: text("requester_email"),
  requesterPhone: text("requester_phone"),
  description: text("description").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectVolunteers = pgTable(
  "project_volunteers",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    volunteerId: integer("volunteer_id")
      .notNull()
      .references(() => volunteers.id, { onDelete: "cascade" }),
    role: text("role"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.volunteerId] })],
);

// No card fields here, ever. Card data goes straight to Stripe.
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  amountCents: integer("amount_cents").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  type: donationType("type").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeSessionId: text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  email: text("email").notNull(),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
