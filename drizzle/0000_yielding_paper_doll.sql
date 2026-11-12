CREATE TYPE "public"."donation_type" AS ENUM('one_time', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('church', 'college_campus', 'high_school_campus', 'sports_team');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('new', 'under_review', 'approved', 'scheduled', 'in_progress', 'completed', 'declined');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount_cents" integer NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"type" "donation_type" NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "donations_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "organization_type" NOT NULL,
	"contact_first_name" text NOT NULL,
	"contact_last_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_volunteers" (
	"project_id" integer NOT NULL,
	"volunteer_id" integer NOT NULL,
	"role" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_volunteers_project_id_volunteer_id_pk" PRIMARY KEY("project_id","volunteer_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "project_status" DEFAULT 'new' NOT NULL,
	"recipient_first_name" text NOT NULL,
	"recipient_last_name" text NOT NULL,
	"recipient_address" text NOT NULL,
	"recipient_city_state_zip" text NOT NULL,
	"recipient_email" text,
	"recipient_phone" text NOT NULL,
	"requester_same_as_recipient" boolean DEFAULT false NOT NULL,
	"requester_first_name" text,
	"requester_last_name" text,
	"requester_email" text,
	"requester_phone" text,
	"description" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"date_of_birth" date,
	"is_18_or_older" boolean NOT NULL,
	"organization_id" integer,
	"notes" text,
	"admin_notes" text,
	"wants_family_listed" boolean DEFAULT false NOT NULL,
	"seeking_church_home" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volunteers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "project_volunteers" ADD CONSTRAINT "project_volunteers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_volunteers" ADD CONSTRAINT "project_volunteers_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;