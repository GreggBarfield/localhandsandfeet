import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({ title, count, children }: { title: string; count?: number; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline gap-3">
      <h1 className="text-3xl font-bold">{title}</h1>
      {count !== undefined && <span className="text-sm text-muted-foreground">{count} shown</span>}
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}

// A plain link, not next/link, so the browser downloads the file instead of Next trying to prefetch it.
export function ExportButton({ kind }: { kind: string }) {
  return (
    <a href={`/admin/export/${kind}`} className="rounded-md border border-border bg-white px-3 py-2 text-sm hover:bg-zinc-50">
      Export CSV
    </a>
  );
}

// Plain GET form: the search text goes in the URL (?q=...) so the list is a normal page.
export function SearchBox({ q, placeholder }: { q: string; placeholder: string }) {
  return (
    <form className="mb-4 flex gap-2" role="search">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="h-10 w-full max-w-sm rounded-md border border-border bg-white px-3 text-sm"
      />
      <button type="submit" className="h-10 rounded-md bg-zinc-900 px-4 text-sm text-white hover:bg-zinc-700">
        Search
      </button>
      {q && (
        <Link href="?" className="flex h-10 items-center px-2 text-sm text-muted-foreground hover:underline">
          Clear
        </Link>
      )}
    </form>
  );
}

export function Table({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-zinc-50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {children}
          {empty && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-muted-foreground">
                Nothing found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;
}

export function Pill({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "amber" | "blue" | "red" }) {
  const tones = {
    gray: "bg-zinc-100 text-zinc-700",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
  };
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under review",
  approved: "Approved",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  declined: "Declined",
};

export const STATUS_TONES: Record<string, "gray" | "green" | "amber" | "blue" | "red"> = {
  new: "blue",
  under_review: "amber",
  approved: "green",
  scheduled: "green",
  in_progress: "blue",
  completed: "gray",
  declined: "red",
};

export const ORG_TYPE_LABELS: Record<string, string> = {
  church: "Church",
  college_campus: "College campus",
  high_school_campus: "High school campus",
  sports_team: "Sports team",
};

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(`${d}T12:00:00`) : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: typeof d === "string" ? undefined : "America/Chicago" });
}
