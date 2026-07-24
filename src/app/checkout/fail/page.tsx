import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment failed",
  robots: { index: false },
};

export default async function FailPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <XCircle className="size-16 text-destructive" />
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Payment failed</h1>
      <p className="mt-3 text-muted-foreground">
        Your payment didn&apos;t go through and you have not been charged. You
        can try again.
      </p>
      {reason && (
        <p className="mt-3 max-w-md rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {reason}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/pricing">Try again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/faq">Get help</Link>
        </Button>
      </div>
    </div>
  );
}
