import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

// deploy.ps1 calls this after a restart. ok is true only when the database answers.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: true });
  } catch {
    return Response.json({ ok: false, db: false }, { status: 503 });
  }
}
