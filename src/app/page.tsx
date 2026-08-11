import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import {
  tracks,
  bundle,
  faqs,
  testimonials,
  techStack,
  heroStats,
  formatBdt,
  getTrack,
} from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PricingCard } from "@/components/pricing-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const valueProps = [
  {
    emoji: "🧭",
    title: "No more tutorial hell",
    body: "A clear, sequenced roadmap so you always know exactly what to learn next — and why it matters for real work.",
  },
  {
    emoji: "🛠️",
    title: "Build real, shippable projects",
    body: "Every module ends in something you can put on GitHub, show a client, or deploy live — the portfolio that gets replies.",
  },
  {
    emoji: "🤖",
    title: "Built for the AI era",
    body: "Learn to build with AI as a force multiplier, not a crutch — the exact skill employers and clients now pay a premium for.",
  },
];

const numberGradients = [
  "linear-gradient(135deg, var(--brand), #8b5cf6)",
  "linear-gradient(135deg, var(--brand-2), #3b82f6)",
  "linear-gradient(135deg, var(--brand-accent), #f43f5e)",
];

export default function Home() {
  const pricingPreview = [getTrack("full-stack-foundations")!, bundle, getTrack("career-launch")!];

  return (
    <>
      {/* Hero */}
      <section className="hero-glow border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:py-28">
          <div className="relative z-10">
            <Badge variant="secondary" className="mb-5">
              Full-stack · AI-era · Job-ready 🇧🇩
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Go from{" "}
              <span className="text-gradient">writing your first line of code</span>{" "}
              to getting paid to build.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              A step-by-step path to becoming a modern full-stack developer —
              built around real projects, priced in BDT, and designed for the AI
              era of software work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#tracks">
                  See the 3 tracks <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#curriculum">Preview the curriculum</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex text-amber-400">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </span>
                <b className="text-foreground">{heroStats[0].value}</b>{" "}
                {heroStats[0].label}
              </span>
              <span>
                <b className="text-foreground">{heroStats[1].value}</b>{" "}
                {heroStats[1].label}
              </span>
              <span>
                <b className="text-foreground">{heroStats[2].value}</b>,{" "}
                {heroStats[2].label}
              </span>
            </div>
          </div>

          {/* Code card */}
          <div className="relative z-10">
            <Card className="overflow-hidden py-0 shadow-xl">
              <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-xs text-muted-foreground">career.js</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7">
                <code>
                  <span className="text-muted-foreground">{"// your path, in three moves"}</span>
                  {"\n"}
                  <span className="text-[#c792ea]">const</span>{" "}
                  <span className="text-[#82aaff]">you</span> ={" "}
                  <span className="text-[#c792ea]">new</span>{" "}
                  <span className="text-[#82aaff]">Developer</span>();{"\n\n"}
                  you.<span className="text-[#82aaff]">learn</span>(
                  <span className="text-[#c3e88d]">&apos;foundations&apos;</span>);{" "}
                  <span className="text-muted-foreground">{"// track 1"}</span>
                  {"\n"}
                  you.<span className="text-[#82aaff]">getHired</span>(
                  <span className="text-[#c3e88d]">&apos;first role&apos;</span>);{" "}
                  <span className="text-muted-foreground">{"// track 2"}</span>
                  {"\n"}
                  you.<span className="text-[#82aaff]">build</span>(
                  <span className="text-[#c3e88d]">&apos;your own income&apos;</span>);{" "}
                  <span className="text-muted-foreground">{"// track 3"}</span>
                  {"\n\n"}
                  <span className="text-[#c792ea]">while</span> (you.
                  <span className="text-[#82aaff]">shipping</span>) {"{"}
                  {"\n  "}you.<span className="text-[#82aaff]">earn</span>();{"\n  "}
                  you.<span className="text-[#82aaff]">grow</span>();{"\n"}
                  {"}"}
                </code>
              </pre>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech marquee */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 sm:px-6">
          {techStack.map((t) => (
            <span key={t} className="text-sm font-semibold text-muted-foreground/70">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Why / value */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Why this exists</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The rules of getting into tech just changed.
          </h2>
          <p className="mt-4 text-muted-foreground">
            AI didn&apos;t kill developer jobs — it raised the bar. Tutorials
            teach syntax; they don&apos;t teach how to think, ship, and get paid.
            This academy closes that gap.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {valueProps.map((v) => (
            <Card key={v.title}>
              <CardContent className="flex flex-col gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-2xl">
                  {v.emoji}
                </div>
                <h3 className="text-lg font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section id="tracks" className="scroll-mt-20 border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">The 3 tracks</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pick where you are. We&apos;ll take you where you want to go.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Each track stands on its own — or stack all three for the complete
              zero-to-income journey.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-5">
            {tracks.map((track, i) => (
              <Card key={track.slug} className="transition-colors hover:border-primary">
                <CardContent className="grid items-center gap-6 sm:grid-cols-[auto_1fr_auto]">
                  <div
                    className="grid size-16 place-items-center rounded-2xl text-2xl font-extrabold text-white"
                    style={{ background: numberGradients[i] }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-2">
                      {track.badge}
                    </span>
                    <h3 className="mt-1 text-xl font-semibold">{track.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {track.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {track.modules.map((m) => (
                        <span
                          key={m.title}
                          className="rounded-md border bg-secondary px-2.5 py-1 text-xs"
                        >
                          {m.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:min-w-36 sm:text-right">
                    <div className="text-sm text-muted-foreground line-through">
                      {formatBdt(track.oldPriceBdt)}
                    </div>
                    <div className="text-2xl font-bold">
                      {formatBdt(track.priceBdt)}
                    </div>
                    <Button asChild className="mt-3 w-full sm:w-auto">
                      <Link href={`/courses/${track.slug}`}>View track</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center sm:flex-row sm:text-left">
            <div>
              <div className="flex items-center gap-2">
                <Badge>{bundle.badge}</Badge>
                <h3 className="text-lg font-semibold">{bundle.title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                All three tracks for {formatBdt(bundle.priceBdt)} — instead of{" "}
                {formatBdt(bundle.oldPriceBdt)} bought separately.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/enroll/all-access">Get All-Access</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">Inside the courses</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A curriculum built like a career, not a playlist.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Click any track to preview what&apos;s inside.
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {tracks.map((track, i) => (
            <AccordionItem key={track.slug} value={track.slug}>
              <AccordionTrigger className="text-base">
                Track {i + 1} · {track.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {track.modules.flatMap((m) =>
                    m.lessons.map((lesson) => (
                      <li key={`${m.title}-${lesson}`} className="flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                        {lesson}
                      </li>
                    ))
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple pricing. Serious outcomes.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Buy a single track, or get everything with the All-Access bundle and
              save the most. Pay in BDT with bKash, Nagad, Rocket, card, or bank.
            </p>
          </div>
          <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
            {pricingPreview.map((track) => (
              <PricingCard key={track.slug} track={track} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Looking for The Builder&apos;s Program too?{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              See all tracks on the pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Testimonials — hidden entirely until there are real ones to show
          (catalog.ts ships an empty array on purpose). */}
      {testimonials.length > 0 && (
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Results</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Careers built, not just courses completed.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="flex flex-col gap-4">
                <div className="inline-flex text-amber-400">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-11 place-items-center rounded-full font-semibold text-white"
                    style={{ background: "var(--brand-gradient)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      )}

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your future in tech starts with one decision.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Stop watching tutorials and start building a career — lifetime
            access, real projects, and a clear path from zero
            to income.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link href="/pricing">
              Start learning today <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {faqs.slice(0, 4).map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/faq">See all FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
