# SaaSFoundry Academy — Tech Stack & Decisions

> Single source of truth for the build. Paste this into any new session so it starts with full context.
> Last updated: 2026-07 · Owner: Lutfur Rahman

---

## 1. What we're building

A course-selling web app for **SaaSFoundry Academy** — a full-stack + AI-era developer education brand.
First market: **Bangladesh** (local payment methods, BDT pricing). International expansion later.

Three course tracks:
1. **Full-Stack Foundations** — beginner → professional.
2. **Career Launch & Job-Market Mastery** — break into the job market / reskill for the AI era.
3. **The Builder's Program** — premium upsell: real projects, SaaS, agency, freelancing, entrepreneurship.

---

## 2. Locked stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One codebase for marketing + app; SSR/SEO for sales pages, server actions for the app. |
| Styling / UI | **Tailwind CSS + shadcn/ui** | Matches the landing page already built; fast, consistent components. |
| Database | **Supabase (PostgreSQL)** — region **East US (Ohio)** | Free tier, managed Postgres, scales later. Deliberately co-located with Netlify's `cmh` functions: only the server talks to Postgres, so the database belongs next to the compute, not next to the users. An earlier Mumbai project made every query a US↔India round trip and put page loads at 10–15s. |
| Auth | **Supabase Auth** | Free within the same platform (50k MAU); drops the need for a separate auth vendor. |
| File storage | **Supabase Storage** | Thumbnails, resources, PDFs — same platform. |
| ORM | **Prisma** | Type-safe schema + migrations over Postgres. |
| Payments | **SSLCommerz** (primary) | One integration → bKash, Nagad, Rocket, cards, bank. aamarPay as fallback. |
| Video | **Unlisted YouTube/Vimeo → Bunny Stream** | Free to validate; cheap protected streaming once earning. |
| Email | **Resend** | Free tier (3k/mo); receipts + onboarding. |
| Hosting | **Cloudflare Workers** (or Netlify) | Free tier that ALLOWS commercial use. (Vercel Hobby is non-commercial only.) |

**Design principle:** keep payments behind a small `PaymentProvider` abstraction so international gateways
(Lemon Squeezy / Paddle) can be added later without touching the rest of the app.

---

## 3. Free-tier limits to respect (launch phase)

- **Supabase (free):** 500 MB database · 1 GB file storage · 5 GB egress/month · 50k monthly active users.
  ⚠️ Project **pauses after 7 days of inactivity** — keep-alive with a scheduled GitHub Actions ping during quiet early days.
- **Cloudflare Workers (free):** generous request allowance; commercial use permitted.
- **Netlify (free):** 100 GB bandwidth/month; commercial use permitted.
- **Resend (free):** 3,000 emails/month, 100/day.
- **SSLCommerz:** no monthly fee — ~2.5% per transaction (higher for AMEX). Settlement to bank account.
- **Bunny Stream:** pay-as-you-go, ~pennies per GB stored + delivered (not free, but cheap).

> ⚠️ **Vercel note:** the free Hobby plan is officially **non-commercial only**. If we ever use Vercel,
> upgrade to Pro ($20/mo) before charging. Default host is Cloudflare/Netlify to stay $0 and compliant.

---

## 4. Payment flow (SSLCommerz — redirect + IPN)

1. User clicks **Enroll** on a track.
2. Server creates a pending `Purchase` row and requests a session from SSLCommerz.
3. User is redirected to SSLCommerz **hosted checkout** and picks bKash / Nagad / Rocket / card / bank.
4. On success, SSLCommerz calls our **IPN webhook** (server-to-server) to confirm payment.
5. Webhook validates the transaction, marks `Purchase` as `paid`, and **grants access** to that track.
6. User is redirected back to a success page; access is already active.

> The data model does NOT change vs. a Stripe-style flow — only the checkout adapter differs.
> Always confirm payment via the IPN webhook, never trust the browser redirect alone.

---

## 5. Environment variables (`.env`)

```bash
# --- App ---
NEXT_PUBLIC_APP_URL=https://www.saasfoundry.space

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, never exposed to client
DATABASE_URL=                       # Prisma connection string (pooled)
DIRECT_URL=                         # Prisma direct connection (migrations)

# --- SSLCommerz ---
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_IS_SANDBOX=true          # flip to false in production

# --- Video (Bunny, when added) ---
BUNNY_STREAM_LIBRARY_ID=
BUNNY_STREAM_API_KEY=

# --- Email (Resend) ---
RESEND_API_KEY=
EMAIL_FROM="SaaSFoundry Academy <no-reply@saasfoundry.space>"
```

---

## 6. Business/legal to prepare in parallel (not code)

For SSLCommerz onboarding, gather (~5 items): **trade license, TIN certificate, business bank account, NID, live website URL.**
aamarPay may require less for individuals. This is often the slowest step — start it early.

---

## 7. Repository conventions

- Single Next.js app (no monorepo yet).
- `/app` — routes · `/components` — UI · `/lib` — server utils (db, payments, auth) · `/prisma` — schema & migrations.
- Payments isolated in `/lib/payments/` behind a `PaymentProvider` interface (`sslcommerz.ts` first).
- All secrets in `.env` (never committed); commit `.env.example` only.
