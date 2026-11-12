import Image from "next/image";
import Link from "next/link";

export function PageBanner({ title, image }: { title: string; image: string }) {
  return (
    <section className="relative isolate flex min-h-64 items-center justify-center overflow-hidden text-white">
      <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/50" />
      <div className="px-5 py-16 text-center">
        <h1 className="text-5xl font-bold md:text-7xl">{title}</h1>
        <nav aria-label="Breadcrumb" className="mt-3 text-sm uppercase tracking-wide">
          <Link href="/" className="text-amber-400 hover:underline">Home</Link>
          <span className="mx-2 text-white/60">/</span>
          <span>{title}</span>
        </nav>
      </div>
    </section>
  );
}
