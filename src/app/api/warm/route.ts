import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// Keep-warm endpoint. A scheduler (cron-job.org) pings this every few minutes
// so the serverless function — and its Prisma connection to the Mumbai
// database — stays booted. That way real visitors rarely pay the cold-start
// cost on the dashboard / course pages. The trivial query also keeps the DB
// connection alive.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, warmedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
