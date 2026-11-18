import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { PageBanner } from "@/components/site/page-banner";
import { VolunteerForm } from "./volunteer-form";

export const metadata: Metadata = { title: "Volunteer - Local Hands & Feet" };

// Reads the organization list when someone visits, not at build time.
export const dynamic = "force-dynamic";

async function getOrganizations() {
  try {
    return await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(eq(organizations.active, true))
      .orderBy(asc(organizations.name));
  } catch (err) {
    console.error("Could not load organizations", err);
    return [];
  }
}

export default async function VolunteerPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org } = await searchParams;
  const orgs = await getOrganizations();
  // Coming back from "Add Organization": pick that organization if it is in the list.
  const initialOrg = orgs.some((o) => String(o.id) === org) ? (org as string) : "";
  return (
    <main>
      <PageBanner title="Volunteer" image="/images/wheelbarrows_dark.jpg" />
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold uppercase">Volunteer</h2>
          <p className="mb-8">
            Join us in sharing the love of Christ by serving those in need. Whether it&apos;s home repairs, lawn care,
            or small projects, your time and skills can make a real impact. Sign up below to volunteer!
          </p>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-3 font-semibold">Volunteer Form</div>
            <div className="p-6">
              <VolunteerForm organizations={orgs} initialOrganizationId={initialOrg} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
