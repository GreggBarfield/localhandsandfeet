import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormProtection } from "@/lib/form-guard";
import { PageBanner } from "@/components/site/page-banner";
import { OrgForm } from "./org-form";

export const metadata: Metadata = { title: "Add Organization - Local Hands & Feet" };

export default async function AddOrganizationPage() {
  // Runs on every request so the form token is stamped with the real page-load time.
  await connection();
  const protection = getFormProtection();
  return (
    <main>
      <PageBanner title="Add Organization" image="/images/contact_us_banner.jpg" />
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold uppercase">Add Organization</h2>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-3 font-semibold">Please complete this form to add an organization.</div>
            <div className="p-6">
              <OrgForm {...protection} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
