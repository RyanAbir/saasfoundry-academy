import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma runs on Cloudflare's Workers runtime through the pg driver adapter
// (the binary query engine can't run there). Workers can't reliably keep a
// Postgres socket open between requests, so a pooled connection may be dead on
// reuse — retire each connection after a single use (maxUses/max = 1) to avoid
// intermittent "connection closed" errors.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    maxUses: 1,
    // Supabase requires TLS. Encrypt the connection but skip cert-chain
    // verification (the Workers runtime can't verify it the usual way).
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
