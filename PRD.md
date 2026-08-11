# SaaSFoundry Academy — Product Requirements (PRD)

> What we're building, for whom, and where the MVP line is drawn.
> Last updated: 2026-07 · Owner: Ryan Mohammad Abir
---

## 1. Problem & goal

Aspiring and mid-career developers in Bangladesh struggle to go from "learning syntax" to
"getting paid to build" — tutorials don't teach job-readiness, and the AI shift has raised the bar.
**Goal:** a paid course platform that takes a learner from zero → hired → earning on their own terms,
sold with local payment methods (bKash/Nagad/Rocket/card) in BDT.

**Success for the MVP** = a learner can discover a track, pay locally, and access the lessons — end to end.

---

## 2. Target users

- **Beginner (Track 1):** total beginners / self-taught coders with gaps. Wants a clear path to job-capable.
- **Job-seeker / reskiller (Track 2):** knows basics but can't break in; or lost ground to the AI shift and needs to be market-fit again.
- **Aspiring earner (Track 3):** graduate of 1–2 who wants to freelance, start a SaaS, or run an agency.

---

## 3. The three tracks (product catalog)

| # | Track | Audience | Price (set BDT) |
|---|---|---|---|
| 1 | Full-Stack Foundations | Beginners | TBD |
| 2 | Career Launch & Job-Market Mastery | Job-seekers / reskillers | TBD |
| 3 | The Builder's Program | Earners (upsell) | TBD |
| — | All-Access Bundle | Everyone (best value) | TBD |

> Pricing to be finalized in BDT. Bundle should be clearly cheaper than buying tracks separately.

---

## 4. MVP scope (v1)

**In scope — the vertical slice that earns money:**
- Public marketing site (port the existing landing page; BDT pricing).
- Account sign-up / login (Supabase Auth: email + Google).
- Buy a track or the bundle via SSLCommerz (bKash/Nagad/Rocket/card/bank).
- Access control: a user can only open lessons for tracks they purchased.
- Student dashboard: "My Courses" + continue where you left off.
- Lesson player: video (unlisted YouTube/Vimeo to start) + text/resources.
- Basic progress tracking (mark lesson complete).
- Transactional email: welcome + purchase receipt (Resend).

**Out of scope for v1 (later):**
- Certificates, quizzes/assignments, community/forum.
- Coupons, affiliates, subscriptions/EMI.
- Admin CMS (seed course content via code/seed script or Supabase table editor at first).
- Mobile app, multi-language, drip scheduling.
- International payment providers (add behind the PaymentProvider interface later).

---

## 5. Core user flows

**Purchase flow**
1. Visitor browses a track → clicks Enroll.
2. If not logged in → prompt sign up / log in.
3. Server creates a pending Purchase → redirect to SSLCommerz hosted checkout.
4. User pays with bKash/Nagad/Rocket/card.
5. IPN webhook confirms → Purchase = paid → access granted.
6. Redirect to success page → track now unlocked in dashboard.

**Learning flow**
1. Logged-in student opens Dashboard → "My Courses".
2. Selects a purchased track → sees modules & lessons.
3. Opens a lesson → watches video / reads content.
4. Marks lesson complete → progress bar updates → next lesson suggested.

**Access-denied flow**
- Unpurchased track shows a locked state with a buy CTA instead of lesson content.

---

## 6. Non-functional requirements

- **Cost:** $0 fixed at launch (free tiers); only per-sale fees + cheap video bandwidth.
- **Security:** confirm payments server-side via IPN only; never trust client redirect. Secrets server-only.
- **Performance/SEO:** marketing pages statically rendered; fast first load.
- **Reliability:** keep-alive ping so the free Supabase project doesn't pause.
- **Mobile-first:** most BD users are on mobile — checkout and player must work great on phones.

---

## 7. Assumptions & open questions

- Domain name — TBD.
- Final BDT prices per track and bundle — TBD.
- Gateway choice: SSLCommerz vs aamarPay (depends on onboarding docs available) — TBD.
- Refund policy wording — TBD (site currently claims 30-day guarantee).
- Do we need invoices/VAT handling for BD business compliance? — confirm with gateway.
