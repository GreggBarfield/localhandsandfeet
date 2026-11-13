import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-white/25 bg-zinc-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/icon-white-png-01.png" alt="" width={44} height={44} priority className="size-11" />
          <span className="leading-tight">
            <span className="block text-lg font-bold">Local Hands &amp; Feet</span>
            <span className="block text-xs text-white/60">Christian Service Projects</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-white/80 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav (no JavaScript needed) */}
        <details className="group relative lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-md p-2 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
            <Menu className="size-6" aria-label="Open menu" />
          </summary>
          <nav
            className="absolute right-0 top-full mt-3 flex w-56 flex-col rounded-lg border border-white/15 bg-zinc-900 p-2 shadow-lg"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
