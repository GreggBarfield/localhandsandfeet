import { readFileSync } from "node:fs";
import { Pool } from "pg";

// One-time import of the organizations from the old FoxPro site (organizations.dbf, exported to
// scripts/data/organizations.json). They are dated 2025-09-11 (when the old table was last saved) so the
// Add Organization flood limit, which counts rows from the last hour, does not see them as new. Safe to run more than once: a name that already exists is skipped.
type Row = {
  name: string;
  type: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
};

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set (check .env)");
  const rows: Row[] = JSON.parse(readFileSync(new URL("./data/organizations.json", import.meta.url), "utf8"));
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let added = 0;
  let skipped = 0;
  try {
    for (const r of rows) {
      const found = await pool.query("select 1 from organizations where lower(name) = lower($1) limit 1", [r.name]);
      if (found.rowCount) {
        skipped++;
        continue;
      }
      await pool.query(
        `insert into organizations (name, type, contact_first_name, contact_last_name, contact_email, contact_phone, active, created_at)
         values ($1, $2::organization_type, $3, $4, $5, $6, true, '2025-09-11')`,
        [r.name, r.type, r.contactFirstName, r.contactLastName, r.contactEmail, r.contactPhone],
      );
      added++;
    }
    const total = await pool.query("select count(*)::int as n from organizations");
    console.log(`Read ${rows.length}, added ${added}, already there ${skipped}. Organizations table now has ${total.rows[0].n} rows.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
