# SaaSFoundry Academy — Launch Plan

> Target: **full launch — all three tracks plus the All-Access bundle**, sold in BDT.
> Companion to `PRD.md` (what) and `BUILD-ORDER.md` (how we got here). This doc covers
> what's left between "code complete" and "taking money".
> Created: 2026-07-25 · Owner: Lutfur Rahman

---

## 0. Where things actually stand

The application is **code-complete against the PRD's v1 scope**. Every item in PRD §4
"in scope" exists and typechecks: marketing site, Supabase auth, purchase flow, server-side
access control, dashboard, lesson player, progress tracking, and transactional email.
Slice 5 polish (error/loading/not-found states, legal pages, analytics hook, keep-warm route)
is in place too.

What is *not* done is everything that isn't code: the courses themselves, the payment
gateway, deployment, and the business setup behind it. Roughly:

| Area | State |
|---|---|
| Application code | ~95% — feature-complete, typecheck clean |
| Course content | ~0% — 30 outlined lessons, all pointing at a placeholder video |
| Payments | Manual bKash/Nagad works; gateway written but unwired and uncredentialed |
| Deployment | Nothing deployed; repo initialized today, no remote |
| Business/legal | Entity name, support email, domain, prices all unset or provisional |

**The content is the long pole.** Everything else on this plan is days of work; recording
three tracks is months. Plan the calendar around that and treat the rest as parallel work.

---

## 1. What this sweep already changed

These are done and committed (`1b4e861`). Each was a launch blocker.

**Removed fabricated social proof.** `src/lib/catalog.ts` shipped three invented student
testimonials ("Ayesha R.", "Marcus K.", "Sana D.") and a "4.9/5 learner rating" carried over
from the landing-page mockup. Publishing invented reviews while charging money is a
false-advertising exposure, not just a polish issue. The testimonials array is now empty and
`src/app/page.tsx` hides that entire section while it stays empty, so the page reflows cleanly.
The hero stat was replaced with a true one ("Pay locally in BDT — bKash & Nagad").

**Corrected two false FAQ claims.** The FAQ promised payment by "bKash, Nagad, Rocket, card,
or bank" with access "granted automatically" — neither is true of the manual flow that
actually ships. It now describes the real process and notes the other methods arrive with the
gateway. The refund FAQ said terms "are being finalized"; it now states the actual policy.

**Filled the legal placeholders.** `terms`, `privacy` and `refund` contained literal
`[Your legal/business name]` and `[contact email]` markers that would have been visible to
buyers. They now interpolate `siteConfig.legalName` and `siteConfig.supportEmail`, so there is
one place to set them. The refund windows are concrete: 7 days, 20% completion cap, 7–10
business days to process. **Confirm these numbers — I filled in the values your own draft
suggested, but they are a commitment you are making, not a technical default.**

**Fixed the admin lockout.** `requireAdmin()` demands `role === "admin"` and nothing in the
codebase ever set that, so `/admin` — the only way to confirm a manual payment — was
unreachable without hand-editing the database. `lib/auth.ts` now promotes any email listed in
`ADMIN_EMAILS` on sign-in. Set to `sm.rakib102@gmail.com` in `.env`; change it if you'll
administer from a different account. The dead `ADMIN_TOKEN` was retired from `.env.example`.

**Closed the manual-purchase account gap.** A buyer paying manually was never told they still
need an account. Their `Purchase` was created against an email-only `User` row with no
`authId`, and access only appears once they sign up with that exact address — which nothing on
screen said. `/checkout/pending` now names the email their access is tied to and offers
sign-up and sign-in buttons.

**Initialized git.** No repository existed, so Netlify had nothing to deploy from and the
Supabase keep-alive Action had nothing to run in. Initialized on `main`, `_to_delete/` added
to `.gitignore`, everything committed. `.env` is correctly excluded.

---

## 2. Decisions only you can make

These block work downstream. Nothing here is a technical question.

**Final BDT prices.** Currently ৳5,000 / ৳5,000 / ৳10,000, bundle ৳15,000, still flagged
`PRICES ARE PLACEHOLDERS` in `catalog.ts`. They flow to every page, the seed, and every
`Purchase` row, so changing them after sales start means inconsistent historical records.

**Legal entity name and support email.** `siteConfig.legalName` and `siteConfig.supportEmail`
are set to provisional values. The entity name must match your trade license — SSLCommerz will
check it, and it appears in your Terms. The support address must actually receive mail; it is
the refund-request channel published in your policy.

**Domain — resolved.** `saasfoundry.space` is registered at Namecheap and the site is served
from `www.saasfoundry.space` (Netlify recommends a subdomain as primary when DNS lives outside
Netlify); the apex redirects to www. `siteConfig.url` now reads `NEXT_PUBLIC_APP_URL`, so set
that to `https://www.saasfoundry.space` in the Netlify environment — local `.env` stays on
localhost.

**Language of instruction.** The FAQ dodges this ("designed for developers in Bangladesh and
built to be approachable"). Buyers will ask before paying ৳15,000. Decide Bangla, English, or
Bangla-explained-English-terms, and say so plainly.

**Gateway choice.** SSLCommerz, aamarPay, or bKash-direct. Adapters for SSLCommerz and bKash
are both written; the choice is about onboarding paperwork, not code.

**Curriculum depth.** The outline is 12 lessons for Full-Stack Foundations and 9 each for
Career Launch and The Builder's Program. Thirty lessons total is thin for a ৳15,000 bundle
against what Bangladeshi buyers can compare it to. Decide the real shape before recording —
re-scoping after you've shot 12 videos is expensive.

---

## 3. Phase 1 — Unblock (target: week 1)

Short, mostly mechanical, and everything else depends on it.

Lock the six decisions above and write the prices into `catalog.ts`, replacing the
`PLACEHOLDERS` comment. Register the domain and set `NEXT_PUBLIC_APP_URL`. Set `legalName` and
`supportEmail` to real values and re-read the three legal pages end to end as a buyer would.

Create the Prisma migration baseline. There is no `prisma/migrations` directory — the schema
was pushed with `db push`, so there's no history and no safe path for production schema
changes. This has to run on your machine (it needs the schema engine and your `DIRECT_URL`,
neither reachable from this session):

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql   # create the dir first
npx prisma migrate resolve --applied 0_init            # mark it applied on the existing DB
```

Push to GitHub and connect Netlify. Add every `.env` value as a Netlify environment variable,
and add `SUPABASE_URL` / `SUPABASE_ANON_KEY` as repository secrets so the keep-alive Action
runs. Verify a deploy succeeds before anything else lands on top of it.

Sign up for Resend and verify your sending domain. Set `RESEND_API_KEY` and `EMAIL_FROM`.
Right now both are blank, so `sendWelcomeEmail` and `sendPurchaseReceipt` log a warning and
return — every buyer silently gets nothing. Send yourself one of each and check they don't
land in spam.

---

## 4. Phase 2 — Content production (the long pole)

**Fix the content pipeline first.** `prisma/seed.ts` skips any track that already has modules
(`if (existing > 0) continue`), which protects progress data but means there is no way to
update a lesson's video ID or notes after the first seed. You cannot ship 30 real lessons
through it. Before recording, build one of:

- a content-sync script that upserts modules and lessons by slug from a content file
  (fastest, keeps content in git, no UI to build), **or**
- the admin CMS from the post-launch backlog, brought forward (slower, but you'll want it
  eventually and it removes you from the deploy loop for typo fixes).

The sync script is the right call for launch. The CMS can wait until content changes often.

**Then the pipeline per lesson:** script → record → edit → upload unlisted to YouTube → set
`videoProvider`/`videoId` → write the Markdown notes and resources → review on a phone.
Note that `durationSec` is seeded as a flat 480 for every lesson and drives display; set it
per lesson as you go.

**Sequence the tracks.** Record Full-Stack Foundations first and completely — it's the
entry point, the largest audience, and the track a buyer is most likely to judge you on. Then
Career Launch, then The Builder's Program. If the calendar slips, you want the slip on the
premium upsell, not the beginner track.

**Set the free previews deliberately.** The seed marks only the first lesson of each track
`isPreview`. That lesson is your entire sales demo — pick the one that best proves the
teaching quality, not necessarily lesson one.

---

## 5. Phase 3 — Payments

Start gateway onboarding **now**, in parallel with recording — it's the slowest external
dependency and it gates launch. SSLCommerz wants a trade license, TIN certificate, business
bank account, NID, and a live website URL. That last one is why the domain and deploy sit in
Phase 1.

While that's in flight, manual collection stays the live path and works. It doesn't scale —
every sale needs you on `/admin` — but it validates demand and it is genuinely how many BD
course sellers start.

When credentials arrive: fill `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD`, switch
`/enroll/[slug]` from `submitManualPayment` to `getPaymentProvider()`, and test in sandbox
across bKash, Nagad, and card. Verify the IPN webhook specifically — `confirmPurchase` is
shared by the webhook and the browser return path and is written to be idempotent, but that
race has never been exercised against a real gateway. Confirm a duplicate confirmation sends
exactly one receipt. Keep manual enrollment reachable as a fallback for when the gateway is
down; it costs nothing to leave in place.

Once the gateway is live, revert the FAQ payment answer to describe automatic access, and
re-add card/Rocket/bank to the supported list.

---

## 6. Phase 4 — Go-live hardening

Point a scheduler (cron-job.org or similar) at `/api/warm` every few minutes so the serverless
function and its Prisma connection to the Mumbai database stay booted — the route exists for
this and nothing is calling it. Confirm the GitHub keep-alive Action has actually run at least
once; the free Supabase project pauses after seven days of inactivity and a paused database
means a dead site.

Turn on analytics by setting `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Without it the `Analytics`
component returns null and you launch blind to where buyers drop off.

Do a security pass on access control: sign in as a user who bought nothing and try to open a
paid lesson URL directly, a lesson from another track, and a bundle-only path. The checks in
`hasCourseAccess` look right, but this is the one bug class that costs you revenue silently.

Re-read every marketing claim on the site as a skeptical buyer. The sweep caught the
testimonials and the FAQ; check the remaining hero and CTA copy for anything implying a
student body or track record you don't have yet.

---

## 7. Phase 5 — Launch

Rehearse the full funnel on a real Android phone over mobile data, not desktop Chrome:
landing page → track detail → enroll → pay a real ৳50-equivalent test → confirm on `/admin` →
receive the receipt → sign up → see the course → watch a lesson → mark complete → see progress
move. Most of your buyers will do exactly this on a mid-range phone.

Then soft-open to a small list before any paid promotion, watch the first ten purchases
closely, and keep `/admin` open — manual confirmation has a human latency your FAQ promises
as "a few hours". Make sure you can meet that.

---

## 8. Risks worth naming

**Content slips.** Three tracks is a lot of recording for one person. The mitigation is
sequencing (Track 1 fully first) and being willing to launch Track 1 alone if the calendar
demands it, with the others as clearly-labelled pre-orders.

**Gateway onboarding stalls.** Common in BD, often weeks. Mitigation: manual collection is
already built and working, so this delays convenience, not revenue.

**Free-tier limits.** Supabase gives 5 GB egress; video lives on YouTube so that's mostly
safe, but watch it as traffic grows. The Bunny Stream migration in the backlog matters more
for content protection than for bandwidth.

**Git in this folder.** Worth knowing: this session can commit but cannot delete, so every git
write leaves a stale `.git/index.lock` behind that blocks the next one. I cleaned up after
each operation, but do your git work from Windows directly. If you want me handling git in
future sessions, start the task on your computer instead of in the cloud (the "Run this task"
picker in the desktop app) — that avoids this mount's delete restriction entirely.

---

## 9. Critical path

```
Decisions ──┬─→ Domain + deploy ──→ Gateway onboarding ──→ Gateway wired ──┐
            │                          (weeks, external)                   ├─→ LAUNCH
            └─→ Content pipeline ──→ Track 1 ──→ Track 2 ──→ Track 3 ──────┘
                                       (the long pole)
```

Everything except content is one to two weeks of focused work. Launch date is set by
recording throughput and, secondarily, by how fast the gateway paperwork clears. Both start
in week 1.
