"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { sendPurchaseReceipt } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";

// Confirm a manual payment: mark paid (grants access) and email the receipt.
export async function confirmPayment(formData: FormData) {
  await requireAdmin();
  const purchaseId = String(formData.get("purchaseId") ?? "");

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { user: true, course: true },
  });
  if (!purchase || purchase.status === "paid") {
    revalidatePath("/admin");
    return;
  }

  const updated = await prisma.purchase.updateMany({
    where: { id: purchaseId, status: { not: "paid" } },
    data: { status: "paid", paidAt: new Date() },
  });

  if (updated.count === 1) {
    await sendPurchaseReceipt({
      to: purchase.user.email,
      name: purchase.user.name ?? "there",
      courseTitle: purchase.course.title,
      amountBdt: purchase.amountBdt,
      transactionId: purchase.providerTxnId ?? purchase.id,
    });
  }

  revalidatePath("/admin");
}

// Reject a manual payment (e.g. TrxID couldn't be verified).
export async function rejectPayment(formData: FormData) {
  await requireAdmin();
  const purchaseId = String(formData.get("purchaseId") ?? "");

  await prisma.purchase.updateMany({
    where: { id: purchaseId, status: "pending" },
    data: { status: "failed" },
  });

  revalidatePath("/admin");
}
