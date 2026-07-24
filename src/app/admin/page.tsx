import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatBdt } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { confirmPayment, rejectPayment } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Redirects to /login (or /dashboard) unless the signed-in user is an admin.
  await requireAdmin();

  const pending = await prisma.purchase.findMany({
    where: { status: "pending" },
    include: { user: true, course: true },
    orderBy: { createdAt: "asc" },
  });
  const recentPaid = await prisma.purchase.findMany({
    where: { status: "paid" },
    include: { user: true, course: true },
    orderBy: { paidAt: "desc" },
    take: 10,
  });

  // Stats
  const revenueAgg = await prisma.purchase.aggregate({
    _sum: { amountBdt: true },
    where: { status: "paid" },
  });
  const revenue = revenueAgg._sum.amountBdt ?? 0;
  const paidCount = await prisma.purchase.count({ where: { status: "paid" } });
  const userCount = await prisma.user.count();

  const stats = [
    { label: "Revenue", value: formatBdt(revenue) },
    { label: "Paid sales", value: String(paidCount) },
    { label: "Pending", value: String(pending.length) },
    { label: "Accounts", value: String(userCount) },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">Admin</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revenue, sales, and manual payment confirmations.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold">
        Pending payments <Badge variant="secondary">{pending.length}</Badge>
      </h2>

      {pending.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing to confirm right now. New submissions appear here.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {pending.map((p: (typeof pending)[number]) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <div className="font-semibold">{p.course.title}</div>
                  <div className="text-muted-foreground">{p.user.email}</div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Amount: <b className="text-foreground">{formatBdt(p.amountBdt)}</b></span>
                    <span>Via: {p.method ?? "—"}</span>
                    <span>TrxID: <b className="font-mono text-foreground">{p.providerTxnId ?? "—"}</b></span>
                    <span>From: {p.valId ?? "—"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={confirmPayment}>
                    <input type="hidden" name="purchaseId" value={p.id} />
                    <Button type="submit" size="sm">Confirm</Button>
                  </form>
                  <form action={rejectPayment}>
                    <input type="hidden" name="purchaseId" value={p.id} />
                    <Button type="submit" size="sm" variant="outline">Reject</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-xl font-semibold">Recently confirmed</h2>
      {recentPaid.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No confirmed payments yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {recentPaid.map((p: (typeof recentPaid)[number]) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border px-4 py-2 text-sm"
            >
              <span>
                {p.user.email} · <span className="text-muted-foreground">{p.course.title}</span>
              </span>
              <span className="font-medium">{formatBdt(p.amountBdt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
