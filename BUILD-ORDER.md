# SaaSFoundry Academy — Build Order

> Ship in thin vertical slices. Each slice is deployable and validates something before the next starts.
> Last updated: 2026-07 · Owner: Lutfur Rahman

---

## Guiding principle

Don't build the whole LMS before selling a seat. Get **marketing + payment** live first to validate demand,
then build the members area. Each milestone below should be deployed and working before moving on.

---

## Slice 0 — Project setup
**Goal:** a running Next.js app on the free host.
- Create Next.js (App Router) + TypeScript project.
- Add Tailwind + shadcn/ui.
- Set up Supabase project (DB + Auth + Storage) and Prisma.
- `.env` + `.env.example`; connect to Supabase.
- Deploy a "hello world" to Cloudflare/Netlify.
- Add the GitHub Actions keep-alive ping for Supabase.

**Done when:** the empty app is live at a URL and connects to the database.

---

## Slice 1 — Marketing site
**Goal:** the public sales pages, live.
- Port the existing landing page into the app (React components).
- Reprice tiers into **BDT**.
- Pages: home, per-track detail (`/courses/[slug]`), pricing, FAQ.
- Wire the dark/light toggle we designed.
- SEO basics: titles, meta, Open Graph.

**Done when:** a visitor can read everything and reach an Enroll button.

---

## Slice 2 — Payments (SSLCommerz)  ← validate demand here
**Goal:** people can actually pay locally.
- `PaymentProvider` interface + `sslcommerz.ts` implementation.
- Enroll → create pending `Purchase` → redirect to hosted checkout.
- **IPN webhook**: validate txn → mark `paid` → grant access.
- Success / failed / cancelled return pages.
- Test in **sandbox** with bKash/Nagad/card, then go live.
- Receipt email via Resend.

**Done when:** a real BDT payment creates a `paid` Purchase via the webhook.

> You can soft-launch here: sell a founding-cohort/pre-order before the members area is fully built.

---

## Slice 3 — Auth & access control
**Goal:** accounts + gated content.
- Supabase Auth: email + Google sign-in.
- Sync auth user → `User` table on first login.
- Server-side access check: "does this user own this course (or the bundle)?"
- Locked-state UI for unpurchased tracks.

**Done when:** only buyers can reach a track's lessons; everyone else sees a buy CTA.

---

## Slice 4 — Course delivery (LMS core)
**Goal:** students can actually learn.
- Seed the 3 tracks + bundle, modules, lessons (Prisma seed script).
- Dashboard → "My Courses".
- Course page → module/lesson list.
- Lesson player: video (`youtube`/`vimeo` to start) + markdown content + resources.
- Progress: mark complete, resume position, progress bar.

**Done when:** a buyer can watch lessons end-to-end and see progress.

---

## Slice 5 — Polish & launch hardening
**Goal:** production-ready.
- Onboarding + receipt emails refined.
- Error/empty/loading states; mobile QA (most BD users are on phones).
- Basic analytics (page views, purchases).
- Refund policy + terms/privacy pages.
- Custom domain + HTTPS.

**Done when:** the full funnel works on mobile and you're confident charging money.

---

## Later (post-launch backlog)
- Migrate video to **Bunny Stream** (protected playback).
- Admin CMS for course content.
- Certificates, quizzes/assignments, community.
- Coupons, affiliates, bundles/EMI.
- International payments (Lemon Squeezy/Paddle) behind the same PaymentProvider interface.

---

## Parallel, non-code track (do alongside)
- Gather SSLCommerz onboarding docs (trade license, TIN, bank account, NID, live site).
- Produce/record the actual course videos for Track 1 first.
- Finalize BDT pricing and the domain name.
