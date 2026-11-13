"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ChurchHomePanel } from "@/components/site/church-home-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContact, type ContactFormState } from "./actions";

const initial: ContactFormState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);
  const v = state.values;
  const err = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-2xl font-bold">Thank You.</h2>
          <p>
            Your message will be reviewed as soon as possible and we will contact you. In the meantime, if you have
            any questions, feel free to <Link href="/contact" className="underline">Contact Us</Link>
          </p>
        </div>
        <ChurchHomePanel />
      </div>
    );
  }

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

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="First Name" error={err.firstName}>
          <Input name="first_name" required defaultValue={v?.firstName} autoComplete="given-name" />
        </Field>
        <Field label="Last Name" error={err.lastName}>
          <Input name="last_name" required defaultValue={v?.lastName} autoComplete="family-name" />
        </Field>
        <Field label="Phone Number" error={err.phone}>
          <Input name="phone" type="tel" defaultValue={v?.phone} autoComplete="tel" />
        </Field>
        <Field label="Email Address" error={err.email}>
          <Input name="email" type="email" required defaultValue={v?.email} autoComplete="email" />
        </Field>
      </div>

      <Field label="Message" error={err.message}>
        <textarea
          name="message"
          rows={5}
          required
          defaultValue={v?.message}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

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
