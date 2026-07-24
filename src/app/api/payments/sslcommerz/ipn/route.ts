import { NextResponse } from "next/server";

import { confirmPurchase } from "@/lib/payments/confirm";

// SSLCommerz IPN (Instant Payment Notification) — server-to-server callback.
// Delegates to the shared confirm logic, which re-validates with SSLCommerz
// before marking a Purchase paid (TECH-STACK.md §4).
export async function POST(req: Request) {
  const payload: Record<string, unknown> = {};
  try {
    const form = await req.formData();
    for (const [k, v] of form.entries()) payload[k] = v;
  } catch {
    return NextResponse.json({ ok: false, error: "bad payload" }, { status: 400 });
  }

  try {
    const result = await confirmPurchase(payload);
    // Always ack 200 for known outcomes so SSLCommerz stops retrying.
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[ipn] confirm error:", err);
    return NextResponse.json({ ok: false, error: "confirm failed" }, { status: 502 });
  }
}
