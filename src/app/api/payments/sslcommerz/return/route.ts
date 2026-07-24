import { NextResponse } from "next/server";

import { confirmPurchase } from "@/lib/payments/confirm";

// SSLCommerz redirects the browser (via POST) to the success/fail/cancel URLs.
// On success we ALSO run the server-to-server confirmation here (not trusting
// the redirect body — confirmPurchase re-validates with SSLCommerz). This lets
// local sandbox testing work even when the IPN can't reach localhost. The IPN
// remains the authoritative backup; confirmation is idempotent either way.
async function handle(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "success";

  const payload: Record<string, unknown> = {};
  let ref = url.searchParams.get("tran_id") ?? "";
  try {
    const form = await req.formData();
    for (const [k, v] of form.entries()) payload[k] = v;
    ref = String(form.get("tran_id") ?? ref);
  } catch {
    // GET or empty body — fall back to the query param.
  }

  const status = type === "fail" ? "fail" : type === "cancel" ? "cancel" : "success";

  if (status === "success") {
    try {
      await confirmPurchase(payload);
    } catch (err) {
      console.error("[return] confirm error:", err);
      // Fall through — the IPN webhook will still confirm it.
    }
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const dest = new URL(`/checkout/${status}`, base);
  if (ref) dest.searchParams.set("ref", ref);

  return NextResponse.redirect(dest, 303);
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
