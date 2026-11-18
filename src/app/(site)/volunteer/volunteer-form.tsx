"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ChurchHomePanel } from "@/components/site/church-home-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitVolunteer, type VolunteerFormState } from "./actions";

type Org = { id: number; name: string };

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const initial: VolunteerFormState = { status: "idle" };

export function VolunteerForm({
  organizations,
  initialOrganizationId = "",
}: {
  organizations: Org[];
  initialOrganizationId?: string;
}) {
  const [state, formAction, pending] = useActionState(submitVolunteer, initial);
  const v = state.values;
  const err = state.fieldErrors ?? {};

  const [inOrg, setInOrg] = useState(v?.inOrganization ?? (initialOrganizationId ? "Y" : ""));
  const [wantsFamily, setWantsFamily] = useState(v?.wantsFamilyListed ?? false);

  if (state.status === "success") return <ThankYou firstName={state.firstName ?? ""} />;

  return (
    <form action={formAction} className="space-y-6" noValidate={false}>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="First Name" error={err.firstName}>
          <Input name="vol_fname" required defaultValue={v?.firstName} autoComplete="given-name" />
        </Field>
        <Field label="Last Name" error={err.lastName}>
          <Input name="vol_lname" required defaultValue={v?.lastName} autoComplete="family-name" />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Phone Number" error={err.phone}>
          <Input name="vol_phone" type="tel" defaultValue={v?.phone} autoComplete="tel" />
        </Field>
        <Field label="Email Address" error={err.email}>
          <Input name="vol_email" type="email" required defaultValue={v?.email} autoComplete="email" />
        </Field>
        <Field label="Are you 18 or Older?" error={err.isEighteenOrOlder}>
          <select name="eighteen_yn" required defaultValue={v?.isEighteenOrOlder ?? ""} className={selectClass}>
            <option value="">Select</option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Are you part of an organization?" error={err.inOrganization}>
          <select
            name="organization_yn"
            required
            value={inOrg}
            onChange={(e) => setInOrg(e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </Field>
        <Field
          label={
            <>
              Organization{" "}
              <span className="ml-2 text-xs font-normal">
                (<Link href="/organizations/new" className="underline">Don&apos;t see yours? Add it here.</Link>)
              </span>
            </>
          }
          error={err.organizationId}
        >
          <select
            name="organization_name"
            disabled={inOrg !== "Y"}
            required={inOrg === "Y"}
            defaultValue={v?.organizationId ?? initialOrganizationId}
            className={selectClass}
          >
            <option value="">Select</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Enter any notes here (Skills? What you want or don't want to do?)" error={err.notes}>
        <textarea
          name="volunteer_proj_notes"
          rows={3}
          defaultValue={v?.notes}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="includeFamily"
            checked={wantsFamily}
            onChange={(e) => setWantsFamily(e.target.checked)}
            className="size-4"
          />
          I want to add family members.
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="church_home" value="Y" defaultChecked={v?.seekingChurchHome} className="size-4" />
          I&apos;m looking for a church home.
        </label>
      </div>

      {wantsFamily && (
        <div className="max-w-sm">
          <Field label="How many of them are under 18?" error={err.familyMinorsCount}>
            <Input
              name="family_minors"
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              required
              defaultValue={v?.familyMinorsCount ?? ""}
            />
          </Field>
          <p className="mt-1 text-xs text-muted-foreground">Enter 0 if none of them are under 18.</p>
        </div>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending..." : "Submit"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ThankYou({ firstName }: { firstName: string }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 text-2xl font-bold">Thank You, {firstName}.</h2>
        <p>
          Your contact information has been entered into our volunteer database and we will contact you when service
          opportunities come up. In the meantime, if you have any questions, feel free to{" "}
          <Link href="/contact" className="underline">Contact Us</Link>
        </p>
      </div>
      <ChurchHomePanel />
    </div>
  );
}
