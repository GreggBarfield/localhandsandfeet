import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata = { title: "Admin - Local Hands & Feet", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-zinc-100 md:flex">
      <aside className="bg-zinc-900 p-4 text-white md:flex md:min-h-screen md:w-60 md:flex-col md:justify-between">
        <div className="grid gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/images/icon-white-png-01.png" alt="" width={40} height={40} className="size-10" />
            <span className="leading-tight">
              <span className="block font-bold">Local Hands &amp; Feet</span>
              <span className="block text-xs text-white/60">Admin</span>
            </span>
          </Link>
          <AdminNav />
        </div>
        <div className="mt-4 grid gap-2 border-t border-white/15 pt-4 text-sm">
          <p className="text-white/70">{admin.name}</p>
          <Link href="/" className="text-white/60 hover:text-white">
            View public site
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-white/60 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
