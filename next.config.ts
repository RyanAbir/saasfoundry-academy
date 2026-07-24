import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // The pg driver (via @prisma/adapter-pg) pulls in pg-cloudflare, which
  // OpenNext's esbuild step can't bundle. Mark these external so they're
  // loaded from node_modules at runtime instead of bundled.
  serverExternalPackages: ["pg", "pg-cloudflare", "@prisma/adapter-pg"],
};

export default nextConfig;

// Makes Cloudflare bindings available during `next dev`.
initOpenNextCloudflareForDev();
