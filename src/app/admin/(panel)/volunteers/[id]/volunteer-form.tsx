"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { areaClass, Field, SaveBar, Section, selectClass } from "@/components/admin/form-bits";
import { updateVolunteerAction, type SaveState } from "./actions";

export type VolunteerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  isEighteenOrOlder: boolean;
  organizationId: number | null;
  notes: string | null;
  adminNotes: string | null;
  wantsFamilyListed: boolean;
  familyMinorsCount: number | null;
  seekingChurchHome: boolean;
};

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4" />
      {label}
    </label>
  );
}

export function VolunteerForm({ volunteerId, values, organizations }: { volunteerId: number; values: VolunteerFormValues; organizations: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(updateVolunteerAction.bind(null, volunteerId), {});
  return (
    <form action={action} className="grid gap-8">
      <Section title="Volunteer">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" name="firstName" defaultValue={values.firstName} required />
          <Field label="Last name" name="lastName" defaultValue={values.lastName} required />
          <Field label="Email" name="email" type="email" defaultValue={values.email} required />
          <Field label="Phone" name="phone" defaultValue={values.phone} />
          <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={values.dateOfBirth} />
          <Field label="Family members under 18" name="familyMinorsCount" type="number" defaultValue={values.familyMinorsCount === null ? "" : String(values.familyMinorsCount)} />
          <div className="grid gap-1.5">
            <Label htmlFor="organizationId">Organization</Label>
            <select id="organizationId" name="organizationId" defaultValue={values.organizationId ?? ""} className={selectClass}>
              <option value="">None</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-2">
          <Check name="isEighteenOrOlder" label="18 or older" defaultChecked={values.isEighteenOrOlder} />
          <Check name="wantsFamilyListed" label="Wants to volunteer with family" defaultChecked={values.wantsFamilyListed} />
          <Check name="seekingChurchHome" label="Looking for a church home" defaultChecked={values.seekingChurchHome} />
        </div>
      </Section>

      <Section title="Volunteer comments" hint="What the volunteer wrote on the form.">
        <textarea name="notes" rows={4} defaultValue={values.notes ?? ""} className={areaClass} aria-label="Volunteer comments" />
      </Section>

      <Section title="Admin notes" hint="Only admins see these.">
        <textarea name="adminNotes" rows={4} defaultValue={values.adminNotes ?? ""} className={areaClass} aria-label="Admin notes" />
      </Section>

      <SaveBar pending={pending} error={state.error} saved={state.saved} label="Save volunteer" />
    </form>
  );
}
