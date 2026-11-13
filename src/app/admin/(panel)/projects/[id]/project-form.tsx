"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATUS_LABELS } from "@/components/admin/data-table";
import { updateProjectAction, type SaveState } from "./actions";

export type ProjectFormValues = {
  name: string;
  status: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientAddress: string;
  recipientCityStateZip: string;
  recipientEmail: string | null;
  recipientPhone: string;
  requesterSameAsRecipient: boolean;
  requesterFirstName: string | null;
  requesterLastName: string | null;
  requesterEmail: string | null;
  requesterPhone: string | null;
  description: string;
  startDate: string | null;
  endDate: string | null;
  adminNotes: string | null;
};

const area = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue: string | null; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  );
}

export function ProjectForm({ projectId, statuses, values }: { projectId: number; statuses: readonly string[]; values: ProjectFormValues }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(updateProjectAction.bind(null, projectId), {});
  return (
    <form action={action} className="grid gap-8">
      <section className="grid gap-4 rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-bold">Project</h2>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Field label="Project name" name="name" defaultValue={values.name} required />
          <div className="grid gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue={values.status} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start date" name="startDate" type="date" defaultValue={values.startDate} />
          <Field label="End date" name="endDate" type="date" defaultValue={values.endDate} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea id="description" name="description" rows={5} defaultValue={values.description} required className={area} />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-bold">Recipient (the person getting help)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" name="recipientFirstName" defaultValue={values.recipientFirstName} required />
          <Field label="Last name" name="recipientLastName" defaultValue={values.recipientLastName} required />
          <Field label="Address" name="recipientAddress" defaultValue={values.recipientAddress} required />
          <Field label="City, state, zip" name="recipientCityStateZip" defaultValue={values.recipientCityStateZip} required />
          <Field label="Phone" name="recipientPhone" defaultValue={values.recipientPhone} required />
          <Field label="Email" name="recipientEmail" type="email" defaultValue={values.recipientEmail} />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-bold">Requester (the person who asked)</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requesterSameAsRecipient" defaultChecked={values.requesterSameAsRecipient} className="size-4" />
          Same as the recipient (the fields below are cleared when saved)
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" name="requesterFirstName" defaultValue={values.requesterFirstName} />
          <Field label="Last name" name="requesterLastName" defaultValue={values.requesterLastName} />
          <Field label="Phone" name="requesterPhone" defaultValue={values.requesterPhone} />
          <Field label="Email" name="requesterEmail" type="email" defaultValue={values.requesterEmail} />
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-bold">Admin notes</h2>
        <p className="-mt-2 text-sm text-muted-foreground">Only admins see these.</p>
        <textarea name="adminNotes" rows={4} defaultValue={values.adminNotes ?? ""} className={area} aria-label="Admin notes" />
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save project"}
        </Button>
        {state.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state.saved && !pending && <p className="text-sm text-green-700">Saved.</p>}
      </div>
    </form>
  );
}
