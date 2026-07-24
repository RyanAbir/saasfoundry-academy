import type { Metadata } from "next";

import { LegalDoc } from "@/components/legal-doc";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "The refund terms for SaaSFoundry Academy course purchases.",
};

const CONTENT = `
We want you to be happy with your purchase. This policy explains when and how you can request a refund.

## Satisfaction guarantee

You can request a full refund within **[7] days** of purchase if the course isn't right for you — **provided you have completed no more than [20%] of the course**. This window and threshold protect against buying, consuming the material, and then asking for money back.

## How to request

Email us at [contact email] from the address on your account, with your name and the course you bought. We'll confirm and process eligible refunds within **[7–10] business days** back to your original payment method (bKash/Nagad/card). Processing times on the payment provider's side may add a few days.

## What isn't refundable

- Requests made after the guarantee window above.
- Purchases where a substantial portion of the course has been completed.
- Cases of account sharing or content redistribution (which also breach our [Terms](/terms)).

## Bundles

For the All-Access bundle, the same window applies from the date of purchase, based on your overall progress across the included tracks.

## Questions

Not sure if you qualify? Just ask at [contact email] — we'll help.
`;

export default function RefundPage() {
  return <LegalDoc title="Refund Policy" updated="July 2026" content={CONTENT} />;
}
