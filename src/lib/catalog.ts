// Marketing catalog for the public site (Slice 1).
//
// This is STATIC marketing content so the marketing pages are fully
// independent of the database. In Slice 4 the same tracks get seeded into
// Postgres via Prisma; the `slug` values here are the join key, so keep them
// in sync with the seed script.
//
// 💰 PRICES ARE PLACEHOLDERS. Edit the `priceBdt` / `oldPriceBdt` numbers
// below — they are the single source of truth for every price shown on the
// site. The All-Access bundle is priced clearly below the sum of the three
// tracks (currently 20,000) to make it the obvious best value.

export const siteConfig = {
  name: "SaaSFoundry Academy",
  shortName: "SaaSFoundry",
  tagline: "From learning syntax to getting paid to build.",
  description:
    "A paid course platform that takes developers in Bangladesh from zero to hired to earning — full-stack and AI-era skills, with local payments in BDT.",
  // Drives canonical links, Open Graph, and the buttons in transactional
  // emails. Reads NEXT_PUBLIC_APP_URL so local dev points at localhost and
  // production points at the live host — set it in Netlify's environment.
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.saasfoundry.space",
  // SET BEFORE LAUNCH. `legalName` must match the entity on your trade
  // license — it appears in Terms/Privacy and is what SSLCommerz onboarding
  // checks against. `supportEmail` is the address printed on the legal pages
  // and used for refund requests; make sure it actually receives mail.
  legalName: "SaaSFoundry Academy",
  supportEmail: "support@saasfoundry.space",
  nav: [
    { title: "Tracks", href: "/#tracks" },
    { title: "Pricing", href: "/pricing" },
    { title: "FAQ", href: "/faq" },
  ] as const,
};

export type CourseLevel = "beginner" | "career" | "builder";

export interface ModuleOutline {
  title: string;
  lessons: string[];
}

export interface Track {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  priceBdt: number;
  oldPriceBdt: number;
  isBundle: boolean;
  /** Short tag shown on the card, e.g. "Beginner" or "Best value". */
  badge?: string;
  /** Whether to visually highlight this option on pricing/home. */
  featured?: boolean;
  audience: string;
  outcomes: string[];
  modules: ModuleOutline[];
}

export const tracks: Track[] = [
  {
    slug: "full-stack-foundations",
    title: "Full-Stack Foundations",
    subtitle: "Beginner → professional. The complete path to job-capable.",
    description:
      "Start from zero and build real, deployable web apps. You'll learn the modern full-stack — HTML/CSS, JavaScript & TypeScript, React and Next.js, APIs, databases, and Git — the way it's actually used on the job, not disconnected tutorials.",
    level: "beginner",
    priceBdt: 5000,
    oldPriceBdt: 8000,
    isBundle: false,
    badge: "Beginner",
    audience:
      "Total beginners and self-taught coders with gaps who want a clear, structured path to being job-capable.",
    outcomes: [
      "Build and deploy complete full-stack apps end to end",
      "Write clean, typed code with TypeScript and React",
      "Model data and work with a real database",
      "Use Git and ship to production with confidence",
    ],
    modules: [
      {
        title: "Web fundamentals",
        lessons: ["How the web works", "HTML & semantic structure", "CSS layout & responsive design"],
      },
      {
        title: "JavaScript & TypeScript",
        lessons: ["Core JavaScript", "The DOM & events", "TypeScript for safer code"],
      },
      {
        title: "React & Next.js",
        lessons: ["Components & state", "Data fetching", "Routing with the App Router"],
      },
      {
        title: "Backend & databases",
        lessons: ["APIs & server actions", "Databases with Postgres", "Auth basics & deployment"],
      },
    ],
  },
  {
    slug: "career-launch",
    title: "Career Launch & Job-Market Mastery",
    subtitle: "Break into the job market — or become market-fit for the AI era.",
    description:
      "You know the basics but can't break in, or the AI shift moved the goalposts. This track makes you hireable: a portfolio that stands out, a CV and profiles that get callbacks, interview and DSA prep, and how to work effectively alongside AI tools.",
    level: "career",
    priceBdt: 5000,
    oldPriceBdt: 7000,
    isBundle: false,
    badge: "Job-ready",
    audience:
      "Developers who know the fundamentals but can't land the role, or who need to re-skill for an AI-shifted market.",
    outcomes: [
      "A standout portfolio and GitHub that get recruiter attention",
      "A CV, LinkedIn, and profiles tuned for callbacks",
      "Interview, DSA, and system-design fundamentals",
      "A repeatable job-search system and AI-era workflow",
    ],
    modules: [
      {
        title: "Positioning",
        lessons: ["Portfolio that converts", "CV & LinkedIn that get callbacks", "Your developer brand"],
      },
      {
        title: "Interview preparation",
        lessons: ["Data structures & algorithms", "System design basics", "Behavioral interviews"],
      },
      {
        title: "The AI-era developer",
        lessons: ["Working with AI tools", "Staying market-fit", "The job-search system"],
      },
    ],
  },
  {
    slug: "builders-program",
    title: "The Builder's Program",
    subtitle: "Real projects, SaaS, agency, freelancing, entrepreneurship.",
    description:
      "The premium track for people who want to earn on their own terms. Build and ship real products, launch a micro-SaaS, land freelance clients, and learn the business side — pricing, positioning, and running lean — so your skills turn into income.",
    level: "builder",
    priceBdt: 10000,
    oldPriceBdt: 15000,
    isBundle: false,
    badge: "Premium",
    featured: true,
    audience:
      "Graduates of the first two tracks (or equivalent) who want to freelance, start a SaaS, or run an agency.",
    outcomes: [
      "Ship a real SaaS product from idea to paying users",
      "Win freelance and agency clients",
      "Price, position, and sell your work",
      "Run lean and reinvest into growth",
    ],
    modules: [
      {
        title: "Build a real SaaS",
        lessons: ["Idea to MVP", "Payments & subscriptions", "Launch & first users"],
      },
      {
        title: "Freelancing & agency",
        lessons: ["Finding clients", "Scoping & pricing work", "Delivering & retaining"],
      },
      {
        title: "The business of building",
        lessons: ["Positioning & offers", "Running lean", "Reinvesting for growth"],
      },
    ],
  },
];

export const bundle: Track = {
  slug: "all-access",
  title: "All-Access Bundle",
  subtitle: "Every track. The complete zero → hired → earning path.",
  description:
    "Get all three tracks together — Full-Stack Foundations, Career Launch, and The Builder's Program — for one price that's well below buying them separately. The complete journey from your first line of code to earning on your own terms.",
  level: "builder",
  priceBdt: 15000,
  oldPriceBdt: 20000,
  isBundle: true,
  badge: "Best value",
  featured: true,
  audience: "Everyone who wants the full path and the best price.",
  outcomes: [
    "All three tracks, unlocked for good",
    "The full path: zero → hired → earning",
    "The single best price — cheaper than buying separately",
    "Every future update to the included tracks",
  ],
  modules: [],
};

/** All sellable products, tracks first then the bundle. */
export const allProducts: Track[] = [...tracks, bundle];

export function getTrack(slug: string): Track | undefined {
  return allProducts.find((t) => t.slug === slug);
}

/** Combined list price of the three individual tracks. */
export const tracksTotalBdt: number = tracks.reduce((sum, t) => sum + t.priceBdt, 0);

/** Format an integer taka amount as e.g. "৳5,000". */
export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-US")}`;
}

export const techStack = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "AI / LLMs",
];

// Every claim below is one you make to someone before they pay you, so it has
// to be true. The fabricated "4.9/5 learner rating" was removed from
// heroStats; add a real rating back only once you have real reviews.
export const heroStats = [
  { label: "in BDT — bKash & Nagad", value: "Pay locally" },
  { label: "access & updates", value: "Lifetime" },
  { label: "not toy demos", value: "Real projects" },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

// ⚠️ EMPTY ON PURPOSE. The three testimonials that used to live here were
// invented for the landing-page mockup — "Ayesha R.", "Marcus K." and
// "Sana D." are not real students, and publishing them while charging money
// is a false-advertising risk. Add entries back only as real students give
// permission; the homepage hides this whole section while the array is empty.
export const testimonials: Testimonial[] = [];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "How do I pay? Which methods are supported?",
    a: "You can pay in BDT with bKash or Nagad. You send the amount to our wallet number and submit your transaction ID; we verify it and unlock your access — usually within a few hours. (Card, Rocket, and bank payments arrive when our payment gateway goes live.)",
  },
  {
    q: "Do I get lifetime access?",
    a: "Yes. When you buy a track (or the All-Access bundle) you get lasting access to its lessons, including future updates to that content.",
  },
  {
    q: "I'm a complete beginner. Where should I start?",
    a: "Start with Full-Stack Foundations — it assumes zero prior experience and takes you to job-capable. If your goal is landing a role, add Career Launch; the All-Access bundle covers everything for the best price.",
  },
  {
    q: "Which track is right for me?",
    a: "Beginners start with Full-Stack Foundations. If you know the basics but can't break in, choose Career Launch. If you want to freelance or build a SaaS, choose The Builder's Program. Want it all? The All-Access bundle is the best value.",
  },
  {
    q: "Is there a refund policy?",
    a: "Yes. You can request a full refund within 7 days of purchase if you have completed no more than 20% of the course. See the Refund Policy for the full terms and how to request one.",
  },
  {
    q: "Are the courses in Bangla or English?",
    a: "The material is designed for developers in Bangladesh and built to be approachable. Full language details are shared on each track before you enroll.",
  },
];
