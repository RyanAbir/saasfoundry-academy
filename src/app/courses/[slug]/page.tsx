import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { tracks, getTrack, formatBdt } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Pre-render a static page for each track at build time.
export function generateStaticParams() {
  return tracks.map((track) => ({ slug: track.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track || track.isBundle) return {};
  return {
    title: track.title,
    description: track.subtitle,
    openGraph: {
      title: track.title,
      description: track.subtitle,
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = getTrack(slug);

  // Bundle has no standalone detail page — send those to pricing via 404.
  if (!track || track.isBundle) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="flex flex-col gap-4">
        <div>
          <Link
            href="/#tracks"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All tracks
          </Link>
        </div>
        {track.badge && <Badge variant="secondary" className="w-fit">{track.badge}</Badge>}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {track.title}
        </h1>
        <p className="text-lg text-muted-foreground">{track.subtitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatBdt(track.priceBdt)}</span>
            {track.oldPriceBdt > track.priceBdt && (
              <span className="text-muted-foreground line-through">
                {formatBdt(track.oldPriceBdt)}
              </span>
            )}
          </div>
          <Button asChild size="lg">
            <Link href={`/enroll/${track.slug}`}>
              Enroll now <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="mt-3 text-muted-foreground">{track.description}</p>
        <p className="mt-4 text-sm">
          <span className="font-medium">Who it&apos;s for: </span>
          <span className="text-muted-foreground">{track.audience}</span>
        </p>
      </section>

      {/* Outcomes */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          What you&apos;ll be able to do
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {track.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-sm">{o}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Curriculum */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Curriculum</h2>
        <div className="mt-4 grid gap-4">
          {track.modules.map((mod, i) => (
            <Card key={mod.title}>
              <CardHeader>
                <CardTitle className="text-base">
                  <span className="text-muted-foreground">
                    Module {i + 1}:{" "}
                  </span>
                  {mod.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson} className="flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Curriculum is an outline and may evolve as lessons are added.
        </p>
      </section>

      {/* CTA */}
      <div className="mt-14 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Start {track.title} today
        </h2>
        <Button asChild size="lg" variant="secondary" className="mt-6">
          <Link href={`/enroll/${track.slug}`}>
            Enroll for {formatBdt(track.priceBdt)}
          </Link>
        </Button>
      </div>
    </div>
  );
}
