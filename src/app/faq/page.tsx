import type { Metadata } from "next";
import Link from "next/link";

import { faqs } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about SaaSFoundry Academy — payments, access, tracks, and refunds.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-muted-foreground">
          Everything you need to know before you enroll.
        </p>
      </div>

      <Accordion type="single" collapsible className="mt-12 w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={faq.q} value={`item-${i}`}>
            <AccordionTrigger className="text-base">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <h2 className="font-semibold">Still have a question?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Take a look at the tracks and pick the one that fits your goal.
        </p>
        <Button asChild className="mt-4">
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>
    </div>
  );
}
