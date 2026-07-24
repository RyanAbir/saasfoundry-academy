import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatBdt } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment submitted",
  robots: { index: false },
};

export default async function PendingPage({
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
        <Clock className="size-16 text-primary" />
      )}

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {confirmed ? "You're enrolled! 🎉" : "Payment submitted"}
      </h1>

      {confirmed ? (
        <p className="mt-3 text-muted-foreground">
          Your payment is confirmed and your access is active. A receipt is on
          its way to your email.
        </p>
      ) : (
        <p className="mt-3 text-muted-foreground">
          Thanks! We&apos;ve recorded your payment
          {purchase ? (
            <>
              {" "}for{" "}
              <span className="font-medium text-foreground">
                {purchase.course.title}
              </span>{" "}
              ({formatBdt(purchase.amountBdt)})
            </>
          ) : null}
          . We&apos;ll verify your transaction and email your access — usually
          within a few hours.
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/faq">Questions?</Link>
        </Button>
      </div>
    </div>
  );
}
