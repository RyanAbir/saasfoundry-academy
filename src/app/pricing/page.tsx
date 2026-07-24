import type { Metadata } from "next";

import { allProducts, bundle, tracksTotalBdt, formatBdt } from "@/lib/catalog";
import { PricingCard } from "@/components/pricing-card";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing in BDT. Buy a single track or get the All-Access bundle — every track for one price, well below buying separately.",
};

export default function PricingPage() {
  const savings = tracksTotalBdt - bundle.priceBdt;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-4 text-muted-foreground">
          One-time payment in BDT. Pay with bKash, Nagad, Rocket, card, or bank.
          Buy a single track, or get the All-Access bundle and save{" "}
          <span className="font-medium text-foreground">{formatBdt(savings)}</span>.
        </p>
      </div>

      <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-4">
        {allProducts.map((track) => (
          <PricingCard key={track.slug} track={track} />
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
        Prices are in Bangladeshi Taka (BDT). Checkout and access unlock are
        coming online as we roll out payments — the Enroll button will take you
        to secure local checkout.
      </p>
    </div>
  );
}
