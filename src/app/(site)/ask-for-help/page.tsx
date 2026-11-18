import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormProtection } from "@/lib/form-guard";
import { PageBanner } from "@/components/site/page-banner";
import { AskForm } from "./ask-form";

export const metadata: Metadata = { title: "Ask for Help - Local Hands & Feet" };

export default async function AskForHelpPage() {
  // Runs on every request so the form token is stamped with the real page-load time.
  await connection();
  const protection = getFormProtection();
  return (
    <main>
      <PageBanner title="Ask for Help" image="/images/ask_help_banner.jpg" />
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold uppercase">Ask for Help</h2>
          <p className="mb-8">
            We all face challenging times, and sometimes a helping hand can make all the difference. If you or someone
            you know needs assistance with home repairs, minor construction projects, lawn care, or similar tasks,
            please fill out the form below. Rest assured, your information will remain completely confidential.
          </p>
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-3 font-semibold">Ask for help on behalf of yourself or someone else.</div>
            <div className="p-6">
              <AskForm {...protection} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
