import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-5">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 rounded-lg bg-zinc-900 py-5 text-white">
          <Image src="/images/icon-white-png-01.png" alt="" width={56} height={56} className="size-14" />
          <p className="text-lg font-bold">Local Hands &amp; Feet</p>
          <p className="text-xs text-white/60">Admin</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
