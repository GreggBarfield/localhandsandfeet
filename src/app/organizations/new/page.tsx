import type { Metadata } from "next";
import { PageBanner } from "@/components/site/page-banner";
import { OrgForm } from "./org-form";

export const metadata: Metadata = { title: "Add Organization - Local Hands & Feet" };

export default function AddOrganizationPage() {
  return (
    <main>
      <PageBanner title="Add Organization" image="/images/contact_us_banner.jpg" />
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold uppercase">Add Organization</h2>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-3 font-semibold">Please complete this form to add an organization.</div>
            <div className="p-6">
              <OrgForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
