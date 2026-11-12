# Local Hands and Feet

Website and admin for Local Hands and Feet, a volunteer service ministry of First Methodist Church in Bryan, TX.

Rewrite of the old Visual FoxPro / FoxWeb site (localhandsandfeet.org) in TypeScript and PostgreSQL.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS, shadcn/ui, shadcncraft blocks
- PostgreSQL with Drizzle ORM
- Stripe Checkout (one-time and recurring donations)
- AWS SES for email, Cloudflare Turnstile for spam protection

## Status

Phase 1 (setup): Next.js app, database schema and deploy scripts are in place. The public pages, forms, admin, Stripe and data migration come next. See the full plan in the Claude project "Local Hands and Feet ReWrite" (`claude/rewrite-plan.md`).

## Local development

    npm install
    copy .env.example .env      (then fill in DATABASE_URL)
    npm run migrate
    npm run dev

## Database

Schema is in `src/db/schema.ts`. After changing it, run `npm run db:generate` and commit the new file in `drizzle/`. `npm run migrate` applies pending migrations and is safe to repeat.

## Deploying

On the server, run `deploy\deploy.ps1` (pulls from GitHub, installs, builds, migrates, restarts the service, checks `/api/health`). First-time setup steps are in `deploy/SERVER-SETUP.md`.

## Secrets

Real keys go in `.env` on the server only. `.env` is ignored by git. Copy `.env.example` to `.env` and fill it in.
