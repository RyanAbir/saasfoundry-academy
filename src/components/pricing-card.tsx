import Link from "next/link";
import { Check } from "lucide-react";

import { type Track, formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PricingCard({ track }: { track: Track }) {
  const { featured } = track;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col",
        featured && "border-primary shadow-md ring-1 ring-primary/20"
      )}
    >
      {track.badge && (
        <Badge
          variant={featured ? "default" : "secondary"}
          className="absolute -top-2.5 left-6"
        >
          {track.badge}
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{track.title}</CardTitle>
        <CardDescription>{track.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{formatBdt(track.priceBdt)}</span>
          {track.oldPriceBdt > track.priceBdt && (
            <span className="text-sm text-muted-foreground line-through">
              {formatBdt(track.oldPriceBdt)}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-3 text-sm">
          {track.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button asChild className="w-full" variant={featured ? "default" : "outline"}>
          <Link href={`/enroll/${track.slug}`}>Enroll now</Link>
        </Button>
        {!track.isBundle && (
          <Button asChild variant="link" className="w-full">
            <Link href={`/courses/${track.slug}`}>View track details</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
