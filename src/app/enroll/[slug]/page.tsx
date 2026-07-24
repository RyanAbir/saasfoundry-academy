import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getTrack, formatBdt } from "@/lib/catalog";
import { getManualMethods } from "@/lib/payments/manual";
import { getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitManualPayment } from "./actions";

export const metadata: Metadata = {
  title: "Enroll",
  robots: { index: false },
};

export default async function EnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const track = getTrack(slug);
  if (!track) notFound();

  const methods = getManualMethods();
  const configured = methods.length > 0;
  const authUser = await getAuthUser();
  const prefillEmail = authUser?.email ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Link
        href={track.isBundle ? "/pricing" : `/courses/${track.slug}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Enroll</h1>
      <p className="mt-2 text-muted-foreground">
        You&apos;re enrolling in{" "}
        <span className="font-medium text-foreground">{track.title}</span> for{" "}
        <span className="font-medium text-foreground">{formatBdt(track.priceBdt)}</span>.
      </p>

      {!configured ? (
        <Card className="mt-8">
          <CardContent className="text-sm text-muted-foreground">
            Payment isn&apos;t set up yet. Add <code>MANUAL_BKASH_NUMBER</code>{" "}
            (and/or <code>MANUAL_NAGAD_NUMBER</code>) to your <code>.env</code> to
            enable enrollment.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Step 1: pay */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">
                Step 1 — Send {formatBdt(track.priceBdt)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {methods.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-semibold">{m.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.action}
                    </div>
                  </div>
                  <div className="font-mono text-lg font-semibold">{m.number}</div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Send exactly {formatBdt(track.priceBdt)}, then copy your
                transaction ID (TrxID) for step 2.
              </p>
            </CardContent>
          </Card>

          {/* Step 2: confirm */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">
                Step 2 — Confirm your payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error === "missing" && (
                <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Please fill in your name, email, the wallet you used, and your
                  transaction ID.
                </p>
              )}
              {error === "duplicate" && (
                <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  That transaction ID has already been submitted. Check the ID,
                  or contact us if you think this is a mistake.
                </p>
              )}

              <form action={submitManualPayment} className="flex flex-col gap-4">
                <input type="hidden" name="slug" value={track.slug} />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full name
                  </label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    defaultValue={prefillEmail}
                    required
                  />
                  <span className="text-xs text-muted-foreground">
                    Your access and receipt are tied to this email.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Which wallet did you use?</span>
                  <div className="flex flex-wrap gap-3">
                    {methods.map((m, i) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="method"
                          value={m.id}
                          defaultChecked={i === 0}
                          required
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="senderNumber" className="text-sm font-medium">
                    Your wallet number{" "}
                    <span className="text-muted-foreground">(the one you paid from)</span>
                  </label>
                  <Input
                    id="senderNumber"
                    name="senderNumber"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="trxId" className="text-sm font-medium">
                    Transaction ID (TrxID)
                  </label>
                  <Input
                    id="trxId"
                    name="trxId"
                    placeholder="e.g. 9AB1CD2EF3"
                    required
                  />
                  <span className="text-xs text-muted-foreground">
                    Found in your bKash/Nagad payment confirmation SMS.
                  </span>
                </div>

                <Button type="submit" size="lg" className="mt-2">
                  Submit &amp; get access
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We verify your payment and email your access — usually within a
                  few hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
