"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getTrack } from "@/lib/catalog";
import { getManualMethods } from "@/lib/payments/manual";

// Manual payment: the buyer sends money to our wallet number and submits their
// transaction id here. We record a PENDING Purchase; an admin confirms it on
// /admin, which grants access and emails the receipt. No gateway required.
export async function submitManualPayment(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const method = String(formData.get("method") ?? "").trim();
  const senderNumber = String(formData.get("senderNumber") ?? "").trim();
  const trxId = String(formData.get("trxId") ?? "").trim().toUpperCase();

  const track = getTrack(slug);
  if (!track) redirect("/pricing");

  const validMethods = getManualMethods().map((m) => m.id) as string[];
  if (!name || !email || !trxId || !validMethods.includes(method)) {
    redirect(`/enroll/${slug}?error=missing`);
  }

  let purchaseId: string;
  try {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) throw new Error("not-seeded");

    const user = await prisma.user.upsert({
      where: { email },
      create: { id: crypto.randomUUID(), email, name },
      update: { name },
    });

    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amountBdt: track.priceBdt,
        provider: method as "bkash" | "nagad",
        status: "pending",
        providerTxnId: trxId, // the buyer's TrxID — unique, so it can't be reused
        method,
        valId: senderNumber || undefined, // sender wallet number, for reconciliation
      },
    });
    purchaseId = purchase.id;
  } catch (err) {
    // Duplicate TrxID (already submitted) → unique constraint P2002.
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      redirect(`/enroll/${slug}?error=duplicate`);
    }
    const reason =
      err instanceof Error && err.message === "not-seeded"
        ? "Courses aren't seeded yet. Run `npm run db:seed`."
        : "Could not record your payment. Please try again.";
    redirect(`/checkout/fail?reason=${encodeURIComponent(reason)}`);
  }

  redirect(`/checkout/pending?ref=${purchaseId}`);
}
