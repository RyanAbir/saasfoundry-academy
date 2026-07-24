# SaaSFoundry Academy

Course-selling web app for full-stack + AI-era developer education. First
market: Bangladesh (BDT pricing, local payments via SSLCommerz). Built to run
at $0 fixed monthly cost on free tiers.

**Stack:** Next.js (App Router) + TypeScript · Tailwind + shadcn/ui · Prisma +
Supabase (Postgres/Auth/Storage) · SSLCommerz · Resend · Netlify.

Planning docs (source of truth) live alongside this app: `TECH-STACK.md`,
`PRD.md`, `DATA-MODEL.md`, `BUILD-ORDER.md`.

## Status

**Slice 0 — Project setup ✓** (this scaffold). Next up: Slice 1 — Marketing site.

## Getting started (local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
#    then fill in the Supabase values (see below)

# 3. Generate the Prisma client and push the schema to your Supabase DB
npm run db:generate
npm run db:push        # or: npm run db:migrate  (creates a migration history)

# 4. Run the dev server
npm run dev            # http://localhost:3000
```

### Supabase setup (free tier)

1. Create a project at supabase.com (region closest to Bangladesh, e.g. Singapore).
2. **Project Settings → API**: copy the Project URL and `anon` key into
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the
   `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (server-only).
3. **Project Settings → Database → Connection string**:
   - `DATABASE_URL` = the **pooled** connection (port 6543, append `?pgbouncer=true`).
   - `DIRECT_URL` = the **direct** connection (port 5432), used by Prisma Migrate.

The free project pauses after 7 days of inactivity — the
`.github/workflows/supabase-keepalive.yml` Action pings it every 3 days. Add
`SUPABASE_URL` and `SUPABASE_ANON_KEY` as repository secrets to enable it.

## Project layout

```
src/app/              routes (App Router)
src/components/ui/     shadcn/ui components
src/lib/prisma.ts      Prisma client singleton
src/lib/payments/       PaymentProvider interface + sslcommerz.ts (gateway-agnostic)
prisma/schema.prisma  data model (see DATA-MODEL.md)
```

Payments sit behind a `PaymentProvider` interface so international gateways can
be added later without touching the rest of the app.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push schema to the DB (no migration history) |
| `npm run db:migrate` | Create + apply a migration |
| `npm run db:studio` | Open Prisma Studio |

## Deploy (Netlify)

`netlify.toml` is configured with `@netlify/plugin-nextjs`. Connect the repo in
Netlify, add all `.env` values as environment variables in the site settings,
and deploy. Free tier allows commercial use.
