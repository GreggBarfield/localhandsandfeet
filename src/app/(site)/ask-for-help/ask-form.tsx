"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ChurchHomePanel } from "@/components/site/church-home-panel";
import { FormProtection } from "@/components/site/form-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAskForHelp, type AskFormState } from "./actions";

const initial: AskFormState = { status: "idle" };

export function AskForm({ formToken, turnstileSiteKey }: { formToken: string; turnstileSiteKey: string }) {
  const [state, formAction, pending] = useActionState(submitAskForHelp, initial);
  const v = state.values;
  const err = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [same, setSame] = useState(v?.requesterSameAsRecipient ?? false);

  if (state.status === "success") return <ThankYou firstName={state.firstName ?? ""} />;

  // "Same as above": copy the recipient's details into the "Your Information" boxes.
  function toggleSame(checked: boolean) {
    setSame(checked);
    const f = formRef.current;
    if (!f) return;
    const pairs: [string, string][] = [
      ["ask_rec_fname", "ask_your_fname"],
      ["ask_rec_lname", "ask_your_lname"],
      ["ask_rec_email", "ask_your_email"],
      ["ask_rec_phone", "ask_your_phone"],
    ];
    for (const [from, to] of pairs) {
      const src = f.elements.namedItem(from) as HTMLInputElement | null;
      const dst = f.elements.namedItem(to) as HTMLInputElement | null;
      if (src && dst) dst.value = checked ? src.value : "";
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
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

      <h3 className="text-base font-bold">Recipient Information</h3>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Recipient First Name" error={err.recipientFirstName}>
          <Input name="ask_rec_fname" required defaultValue={v?.recipientFirstName} />
        </Field>
        <Field label="Recipient Last Name" error={err.recipientLastName}>
          <Input name="ask_rec_lname" required defaultValue={v?.recipientLastName} />
        </Field>
        <Field label="Recipient Address" error={err.recipientAddress}>
          <Input name="ask_rec_address" required defaultValue={v?.recipientAddress} autoComplete="street-address" />
        </Field>
        <Field label="Recipient City, State, and Zip" error={err.recipientCityStateZip}>
          <Input name="ask_rec_city" required defaultValue={v?.recipientCityStateZip} />
        </Field>
        <Field label="Email Address" error={err.recipientEmail}>
          <Input name="ask_rec_email" type="email" defaultValue={v?.recipientEmail} />
        </Field>
        <Field label="Phone Number" error={err.recipientPhone}>
          <Input name="ask_rec_phone" type="tel" required defaultValue={v?.recipientPhone} />
        </Field>
      </div>

      <h3 className="pt-2 text-base font-bold">Your Information</h3>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="homepostalcheck"
          value="Y"
          checked={same}
          onChange={(e) => toggleSame(e.target.checked)}
          className="size-4"
        />
        Same as Above.
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your First Name" error={err.requesterFirstName}>
          <Input name="ask_your_fname" required defaultValue={v?.requesterFirstName} autoComplete="given-name" />
        </Field>
        <Field label="Your Last Name" error={err.requesterLastName}>
          <Input name="ask_your_lname" required defaultValue={v?.requesterLastName} autoComplete="family-name" />
        </Field>
        <Field label="Email Address" error={err.requesterEmail}>
          <Input name="ask_your_email" type="email" required defaultValue={v?.requesterEmail} autoComplete="email" />
        </Field>
        <Field label="Phone Number" error={err.requesterPhone}>
          <Input name="ask_your_phone" type="tel" required defaultValue={v?.requesterPhone} autoComplete="tel" />
        </Field>
      </div>

      <h3 className="pt-2 text-base font-bold">Project Information</h3>
      <Field label="Describe Project" error={err.description}>
        <textarea
          name="ask_proj_description"
          rows={4}
          required
          defaultValue={v?.description}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      <FormProtection formToken={formToken} turnstileSiteKey={turnstileSiteKey} answer={state} />

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
          Your request will be reviewed as soon as possible and we will contact you. In the meantime, if you have any
          questions, feel free to <Link href="/contact" className="underline">Contact Us</Link>
        </p>
      </div>
      <ChurchHomePanel />
    </div>
  );
}
