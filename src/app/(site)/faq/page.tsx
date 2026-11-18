import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageBanner } from "@/components/site/page-banner";

export const metadata: Metadata = { title: "Frequently Asked Questions - Local Hands & Feet" };

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What type of projects are you typically looking for?",
    answer: (
      <>
        <p>
          We are blessed to be able to serve our community by offering volunteer-based projects that provide
          much-needed assistance to individuals and families. The types of projects we typically undertake include:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <b>Small Construction &amp; Repair Projects</b> - Our volunteers can help with minor home repairs, such as
            fixing fences, patching drywall, painting, replacing damaged boards, and other basic maintenance tasks. We
            also specialize in building wheelchair ramps to improve accessibility for those in need.
          </li>
          <li>
            <b>Lawn &amp; Garden Care</b> - We assist with yard maintenance, including mowing, trimming, raking leaves,
            planting flowers, spreading mulch, pulling weeds, and general outdoor clean-up to help improve curb appeal
            and provide a safe, welcoming environment.
          </li>
          <li>
            <b>General Home Maintenance &amp; Cleanup</b> - Our teams can help with light interior and exterior
            clean-up, including organizing spaces, decluttering, minor weatherproofing, or other small tasks that make
            a home safer and more comfortable.
          </li>
        </ul>
        <p>
          Whenever possible, we provide the necessary tools and supplies to complete these projects. However, if
          specialized materials or equipment are needed, we will work with you to determine the best way to secure
          them.
        </p>
        <p>
          While some projects may be beyond the scope of what our volunteers can accomplish, we encourage you to reach
          out and let us know your needs. If we are unable to complete a project ourselves, we will do our best to
          connect you with the appropriate resources, organizations, or skilled professionals who may be able to help.
          Above all, we believe in the power of community and faith. No challenge is too big for God to handle, and
          together, we can make a meaningful impact in the lives of those around us. If you or someone you know could
          use a helping hand, please don&apos;t hesitate to reach out!
        </p>
      </>
    ),
  },
  {
    question: "If I volunteer, can I bring my children?",
    answer: (
      <>
        <p>
          Yes! We encourage families to volunteer together. However, children under the age of 16 must be accompanied
          by a parent or guardian at all times. As a parent or guardian, you will be responsible for supervising your
          child on the job site.
        </p>
        <p>
          Please note that some activities may not be suitable for young children, and the project leader has the
          discretion to determine which tasks are appropriate for their safety and well-being. We ask that you respect
          these decisions.
        </p>
        <p>
          When signing up, you&apos;ll find an option on the volunteer form that says, &quot;I want to add family
          members.&quot; Check that box and tell us how many of them are under 18, so that we can plan accordingly.
        </p>
      </>
    ),
  },
  {
    question: "Do you have any jobs for older or 'less mobile' community members who want to support a project?",
    answer: (
      <>
        <p>
          Absolutely! There are many ways to contribute beyond physical labor. Volunteers who may not be able to
          participate in hands-on tasks can still play a valuable role by:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Preparing or delivering meals and snacks for the volunteers</li>
          <li>Offering prayer and encouragement to teams on-site</li>
          <li>Assisting with coordination, check-ins, or administrative support</li>
        </ul>
        <p>
          Every effort and act of kindness makes a difference, and we appreciate any way you are able to serve. To get
          involved, simply sign up using the volunteer registration form and let us know how you&apos;d like to help.
        </p>
      </>
    ),
  },
  {
    question: "If I make a donation, what will the money be used for?",
    answer: (
      <>
        <p>
          100% of donations go directly toward funding specific projects. This includes purchasing essential supplies
          such as building materials, tools, and other necessary resources.
        </p>
        <p>
          For larger projects, we may be able to provide a breakdown of the materials needed. This allows donors to
          choose a specific item to purchase, ensuring that your contribution fits within your budget while making a
          meaningful impact.
        </p>
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main>
      <PageBanner title="FAQ" image="/images/faq_banner.jpg" />
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold uppercase">Have Questions?</h2>
          <p className="mb-12 font-medium">
            Hopefully some of them will be answered below. If not, please{" "}
            <Link href="/contact" className="underline">Contact Us</Link>
          </p>

          <div className="grid items-start gap-10 lg:grid-cols-2">
            <Image
              src="/images/faq_side.jpg"
              alt="Volunteers helping with a project"
              width={700}
              height={700}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full rounded-2xl"
            />
            <div className="divide-y">
              {faqs.map((f) => (
                <details key={f.question} name="faq" className="group py-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-3 pb-4 text-sm">{f.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
