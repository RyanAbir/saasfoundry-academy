import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatBdt } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment successful",
  robots: { index: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const purchase = ref
    ? await prisma.purchase.findUnique({
        where: { id: ref },
        include: { course: true },
      })
    : null;

  const confirmed = purchase?.status === "paid";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      {confirmed ? (
        <CheckCircle2 className="size-16 text-brand-3" />
      ) : (
        <Clock className="size-16 text-muted-foreground" />
      )}

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {confirmed ? "You're enrolled! 🎉" : "Payment received"}
      </h1>

      {purchase ? (
        <p className="mt-3 text-muted-foreground">
          {confirmed ? (
            <>
              Your payment for{" "}
              <span className="font-medium text-foreground">{purchase.course.title}</span>{" "}
              ({formatBdt(purchase.amountBdt)}) is confirmed and your access is
              active.
            </>
          ) : (
            <>
              Thanks! We&apos;re confirming your payment for{" "}
              <span className="font-medium text-foreground">{purchase.course.title}</span>.
              This usually takes a few seconds — refresh this page shortly. A
              receipt will be emailed once it&apos;s confirmed.
            </>
          )}
        </p>
      ) : (
        <p className="mt-3 text-muted-foreground">
          Thanks for your payment. Your receipt will arrive by email once it&apos;s
          confirmed.
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pricing">Browse tracks</Link>
        </Button>
      </div>
    </div>
  );
}
