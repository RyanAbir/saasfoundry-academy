import type { Metadata } from "next";
import Link from "next/link";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false },
};

export default function CancelPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <Ban className="size-16 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Payment cancelled</h1>
      <p className="mt-3 text-muted-foreground">
        You cancelled the checkout and haven&apos;t been charged. Whenever
        you&apos;re ready, your track is waiting.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/pricing">Back to pricing</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
