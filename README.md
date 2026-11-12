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

Phase 1 (setup). See the full plan in the Claude project "Local Hands and Feet ReWrite" (`claude/rewrite-plan.md`).

## Secrets

Real keys go in `.env` on the server only. `.env` is ignored by git. Copy `.env.example` to `.env` and fill it in.
