import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const areaClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
export const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue: string | null | undefined; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-lg border border-border bg-white p-5">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function SaveBar({ pending, error, saved, label }: { pending: boolean; error?: string; saved?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {saved && !pending && <p className="text-sm text-green-700">Saved.</p>}
    </div>
  );
}
