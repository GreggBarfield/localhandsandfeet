import { Pool } from "pg";
import { hashPassword } from "../src/lib/password";

// Usage: npm run admin:create -- someone@example.com "Their Name" "their-password"
// Run it again with the same email to reset that person's password.
async function main() {
  const [email, name, password] = process.argv.slice(2);
  if (!email || !name || !password) {
    throw new Error('Usage: npm run admin:create -- <email> "<name>" "<password>"');
  }
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set (check .env)");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(
      `insert into admin_users (email, name, password_hash) values ($1, $2, $3)
       on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash`,
      [email.trim().toLowerCase(), name.trim(), await hashPassword(password)],
    );
    console.log(`Admin saved: ${email.trim().toLowerCase()}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
