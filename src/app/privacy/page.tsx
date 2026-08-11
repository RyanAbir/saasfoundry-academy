import type { Metadata } from "next";

import { LegalDoc } from "@/components/legal-doc";
import { siteConfig } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SaaSFoundry Academy collects, uses, and protects your data.",
};

const CONTENT = `
This Privacy Policy explains how SaaSFoundry Academy, operated by ${siteConfig.legalName}, handles your information.

## What we collect

- **Account data:** your name, email, and (if provided) phone number.
- **Purchase data:** the courses you buy, amount, and a payment transaction reference. Payment details (wallet PIN, card numbers) are handled by the payment provider — we never see or store them.
- **Learning data:** your progress through lessons.
- **Usage data:** basic, privacy-friendly analytics such as page views (no invasive tracking).

## How we use it

To provide your account and course access, confirm payments, send receipts and important notices, improve the platform, and meet legal obligations.

## Payment processing

Payments are processed by our payment partners (e.g. bKash/Nagad or an aggregator). Their handling of your payment information is governed by their own privacy policies.

## Where your data lives

Account, purchase, and progress data is stored in our database (Supabase). Transactional emails are sent via Resend. These providers process data on our behalf.

## Sharing

We don't sell your data. We share it only with the service providers needed to run the platform (payments, database, email, hosting), and where required by law.

## Your choices

You can request access to, correction of, or deletion of your personal data by contacting us. Deleting your account removes your access to purchased courses.

## Retention & security

We keep data for as long as your account is active or as needed for legal and accounting purposes, and we take reasonable measures to protect it.

## Children

The platform is not intended for children under 13.

## Changes & contact

We may update this policy; changes are posted here. Questions or requests? Contact us at ${siteConfig.supportEmail}.
`;

export default function PrivacyPage() {
  return <LegalDoc title="Privacy Policy" updated="July 2026" content={CONTENT} />;
}
