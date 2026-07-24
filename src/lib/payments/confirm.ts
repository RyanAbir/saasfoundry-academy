import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { sendPurchaseReceipt } from "@/lib/email";

export type ConfirmResult = "paid" | "failed" | "already" | "unknown";

// Shared confirmation logic used by BOTH the IPN webhook and the browser
// return handler. Either path re-validates the transaction server-to-server
// with SSLCommerz (never trusting the redirect payload alone) before marking a
// Purchase paid. Whichever arrives first wins; the atomic conditional update
// guarantees the receipt email is sent exactly once.
export async function confirmPurchase(
  payload: Record<string, unknown>
): Promise<ConfirmResult> {
  const purchaseId = String(payload.tran_id ?? "");
  if (!purchaseId) return "unknown";

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { user: true, course: true },
  });
  if (!purchase) return "unknown";
  if (purchase.status === "paid") return "already";

  const provider = getPaymentProvider("sslcommerz");
  if (!provider.validateIpn) throw new Error("validateIpn unavailable");
  const result = await provider.validateIpn(payload);
  const amountOk = result.amountBdt === purchase.amountBdt;

  if (result.isPaid && amountOk) {
    // Atomic: only the first path that flips pending→paid gets count === 1,
    // so the email fires once even if IPN and return race.
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
    return "paid";
  }

  await prisma.purchase.updateMany({
    where: { id: purchase.id, status: "pending" },
    data: { status: "failed", providerTxnId: result.providerTxnId },
  });
  return "failed";
}
