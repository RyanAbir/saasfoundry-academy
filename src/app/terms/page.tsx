import type { Metadata } from "next";

import { LegalDoc } from "@/components/legal-doc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of SaaSFoundry Academy.",
};

const CONTENT = `
Welcome to SaaSFoundry Academy ("we", "us", "our"), operated by [Your legal/business name] in Bangladesh. By creating an account or purchasing a course, you agree to these Terms.

## 1. Accounts

You must provide accurate information and keep your login secure. You're responsible for activity under your account. You must be able to form a binding contract to purchase.

## 2. Courses, pricing & payment

Course prices are shown in Bangladeshi Taka (BDT) and may change over time; the price shown at checkout applies to your purchase. Payments are processed by our payment partners (e.g. bKash/Nagad and, where applicable, an aggregator). We don't store your full payment credentials.

## 3. Access & licence

When your payment is confirmed, we grant you a personal, non-transferable, non-exclusive licence to access the purchased course content for your own learning. You may not share your account, redistribute, resell, record, or publicly post the course materials.

## 4. Acceptable use

Don't misuse the platform: no attempts to breach security, scrape content at scale, or infringe others' rights. We may suspend accounts that violate these Terms or share paid content.

## 5. Intellectual property

All course videos, notes, and materials are owned by us or our licensors and are protected by law. Your licence does not transfer any ownership.

## 6. Refunds

Refunds are governed by our [Refund Policy](/refund).

## 7. Disclaimers

Courses are provided "as is" for educational purposes. We don't guarantee any specific job, income, or outcome — results depend on your effort and circumstances.

## 8. Limitation of liability

To the extent permitted by law, our total liability for any claim is limited to the amount you paid for the relevant course.

## 9. Changes

We may update these Terms; material changes will be posted here with a new "last updated" date. Continued use means you accept the changes.

## 10. Governing law & contact

These Terms are governed by the laws of Bangladesh. Questions? Contact us at [contact email].
`;

export default function TermsPage() {
  return <LegalDoc title="Terms of Service" updated="July 2026" content={CONTENT} />;
}
