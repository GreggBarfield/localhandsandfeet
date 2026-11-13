"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Field, SaveBar, Section, selectClass } from "@/components/admin/form-bits";
import { ORG_TYPE_LABELS } from "@/components/admin/data-table";
import { updateOrganizationAction, type SaveState } from "./actions";

export type OrgFormValues = {
  name: string;
  type: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  active: boolean;
};

export function OrgForm({ organizationId, types, values }: { organizationId: number; types: readonly string[]; values: OrgFormValues }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(updateOrganizationAction.bind(null, organizationId), {});
  return (
    <form action={action} className="grid gap-8">
      <Section title="Organization">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Organization name" name="name" defaultValue={values.name} required />
          <div className="grid gap-1.5">
            <Label htmlFor="type">Type</Label>
            <select id="type" name="type" defaultValue={values.type} className={selectClass}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {ORG_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={values.active} className="size-4" />
          Active (shows in the volunteer sign-up list)
        </label>
      </Section>

      <Section title="Contact person">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" name="contactFirstName" defaultValue={values.contactFirstName} required />
          <Field label="Last name" name="contactLastName" defaultValue={values.contactLastName} required />
          <Field label="Email" name="contactEmail" type="email" defaultValue={values.contactEmail} required />
          <Field label="Phone" name="contactPhone" defaultValue={values.contactPhone} required />
        </div>
      </Section>

      <SaveBar pending={pending} error={state.error} saved={state.saved} label="Save organization" />
    </form>
  );
}
