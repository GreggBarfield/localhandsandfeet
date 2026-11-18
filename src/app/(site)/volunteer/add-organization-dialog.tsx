"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormProtection } from "@/components/site/form-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORG_TYPES } from "@/lib/validation/organization";
import { submitOrganizationInline, type OrgFormState } from "../organizations/new/actions";

const initial: OrgFormState = { status: "idle" };

// A popup for adding an organization without leaving the Volunteer form.
// It sits outside the Volunteer <form> (a form cannot live inside another form).
export function AddOrganizationDialog({
  open,
  onClose,
  onAdded,
  formToken,
  turnstileSiteKey,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (org: { id: number; name: string }) => void;
  formToken: string;
  turnstileSiteKey: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dark area around the box closes it.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(36rem,calc(100%-2rem))] rounded-xl border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/50"
    >
      {/* The form is only built while the popup is open, so every opening starts clean. */}
      {open && <DialogForm onClose={onClose} onAdded={onAdded} formToken={formToken} turnstileSiteKey={turnstileSiteKey} />}
    </dialog>
  );
}

function DialogForm({
  onClose,
  onAdded,
  formToken,
  turnstileSiteKey,
}: {
  onClose: () => void;
  onAdded: (org: { id: number; name: string }) => void;
  formToken: string;
  turnstileSiteKey: string;
}) {
  const [state, formAction, pending] = useActionState(submitOrganizationInline, initial);
  const v = state.values;
  const err = state.fieldErrors ?? {};

  // When the organization is saved, drop it into the Volunteer form and close.
  const handed = useRef(false);
  useEffect(() => {
    if (state.status === "success" && state.org && !handed.current) {
      handed.current = true;
      onAdded(state.org);
    }
  }, [state, onAdded]);

  return (
    <form action={formAction} className="space-y-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold">Add Your Organization</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 text-2xl leading-none text-muted-foreground hover:text-foreground">
          &times;
        </button>
      </div>

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
        <Input name="org_name" required defaultValue={v?.name} autoFocus />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Add Organization"}
        </Button>
      </div>
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
