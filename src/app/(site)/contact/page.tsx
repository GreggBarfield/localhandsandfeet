import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormProtection } from "@/lib/form-guard";
import { PageBanner } from "@/components/site/page-banner";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact Us - Local Hands & Feet" };

export default async function ContactPage() {
  // Runs on every request so the form token is stamped with the real page-load time.
  await connection();
  const protection = getFormProtection();
  return (
    <main>
      <PageBanner title="Contact" image="/images/contact_us_banner.jpg" />
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold uppercase">Contact Us</h2>
          <p className="mb-8">
            Use the form below to ask a question, make a comment, or suggest improvements for our services. We will
            respond as soon as possible.
          </p>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-3 font-semibold">Please complete this form to contact us.</div>
            <div className="p-6">
              <ContactForm {...protection} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
