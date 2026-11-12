import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[3fr_1fr] lg:px-8">
        <div className="lg:pr-16">
          <h2 className="pb-2 text-lg font-bold">About Us</h2>
          <p className="text-white/60">
            Local Hands and Feet is a faith-driven initiative led by members of First Methodist Church in Bryan, TX,
            dedicated to matching volunteers with meaningful service opportunities in the Brazos Valley. Rooted in
            Christ’s call to serve others, this initiative seeks to embody the love of Jesus through tangible acts of
            kindness.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-lg font-bold">Useful Links</h2>
          <ul className="grid gap-2 text-white/70">
            <li>
              <Link href="/" className="hover:text-white">Home</Link>
            </li>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 md:flex-row md:justify-between lg:px-8">
          <ContactItem icon={<MapPin className="size-5" />} label="Address:">
            506 East 28th Street, Bryan, TX 77803
          </ContactItem>
          <ContactItem icon={<Phone className="size-5" />} label="Phone:">
            <a href="tel:+19797791324" className="hover:text-white">979-779-1324</a>
          </ContactItem>
          <ContactItem icon={<Mail className="size-5" />} label="Email:">
            <a href="mailto:info@localhandsandfeet.org" className="hover:text-white">info@localhandsandfeet.org</a>
          </ContactItem>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-white/60 lg:px-8">
        Copyright © Local Hands &amp; Feet {new Date().getFullYear()}
      </div>
    </footer>
  );
}

function ContactItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-full border border-white/30">{icon}</div>
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-sm text-white/60">{children}</p>
      </div>
    </div>
  );
}
