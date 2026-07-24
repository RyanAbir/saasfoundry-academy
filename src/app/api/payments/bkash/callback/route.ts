import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { sendPurchaseReceipt } from "@/lib/email";

// bKash redirects the customer's browser back here (GET) with paymentID and a
// status. On success we EXECUTE the payment server-to-server (bKash's confirm
// step) before marking the Purchase paid — the redirect alone is never trusted.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get("paymentID") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  const to = (path: string, ref?: string) => {
    const dest = new URL(path, base);
    if (ref) dest.searchParams.set("ref", ref);
    return NextResponse.redirect(dest, 303);
  };

  if (!paymentId) return to("/checkout/fail");

  // We stored the bKash paymentID on the Purchase at creation time.
  const purchase = await prisma.purchase.findFirst({
    where: { providerTxnId: paymentId },
    include: { user: true, course: true },
  });
  if (!purchase) return to("/checkout/fail");
  if (purchase.status === "paid") return to("/checkout/success", purchase.id);

  if (status === "cancel") return to("/checkout/cancel", purchase.id);
  if (status !== "success") return to("/checkout/fail", purchase.id);

  try {
    const provider = getPaymentProvider("bkash");
    if (!provider.executePayment) throw new Error("executePayment unavailable");
    const result = await provider.executePayment(paymentId);

    const amountOk = result.amountBdt === purchase.amountBdt;
    if (result.isPaid && amountOk) {
      // Atomic pending->paid so the receipt fires exactly once.
      const updated = await prisma.purchase.updateMany({
        where: { id: purchase.id, status: { not: "paid" } },
        data: {
          status: "paid",
          paidAt: new Date(),
          valId: result.valId,
          method: result.method,
          providerTxnId: result.providerTxnId,
        },
      });
      if (updated.count === 1) {
        await sendPurchaseReceipt({
          to: purchase.user.email,
          name: purchase.user.name ?? "there",
          courseTitle: purchase.course.title,
          amountBdt: purchase.amountBdt,
          transactionId: result.providerTxnId,
        });
      }
      return to("/checkout/success", purchase.id);
    }

    await prisma.purchase.updateMany({
      where: { id: purchase.id, status: "pending" },
      data: { status: "failed" },
    });
    return to("/checkout/fail", purchase.id);
  } catch (err) {
    console.error("[bkash callback] execute error:", err);
    return to("/checkout/fail", purchase.id);
  }
}
