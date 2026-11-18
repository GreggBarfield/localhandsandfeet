"use client";

import { useActionState } from "react";
import { FormProtection } from "@/components/site/form-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORG_TYPES } from "@/lib/validation/organization";
import { submitOrganization, type OrgFormState } from "./actions";

const initial: OrgFormState = { status: "idle" };

export function OrgForm({ formToken, turnstileSiteKey }: { formToken: string; turnstileSiteKey: string }) {
  const [state, formAction, pending] = useActionState(submitOrganization, initial);
  const v = state.values;
  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
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

      <Field label="Organization Name" error={err.name}>
        <Input name="org_name" required defaultValue={v?.name} />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Contact First Name" error={err.contactFirstName}>
          <Input name="org_contact_fname" required defaultValue={v?.contactFirstName} />
        </Field>
        <Field label="Contact Last Name" error={err.contactLastName}>
          <Input name="org_contact_lname" required defaultValue={v?.contactLastName} />
        </Field>
        <Field label="Contact Email Address" error={err.contactEmail}>
          <Input name="org_contact_email" type="email" required defaultValue={v?.contactEmail} />
        </Field>
        <Field label="Contact Phone Number" error={err.contactPhone}>
          <Input name="org_contact_phone" type="tel" required defaultValue={v?.contactPhone} />
        </Field>
        <Field label="Organization Type" error={err.type}>
          <select
            name="organization_type"
            required
            defaultValue={v?.type ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select</option>
            {ORG_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <FormProtection formToken={formToken} turnstileSiteKey={turnstileSiteKey} answer={state} />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Submit"}
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
