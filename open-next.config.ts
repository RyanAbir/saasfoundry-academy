import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: SSR/dynamic pages only, no ISR incremental cache (which
// would need an R2 bucket). Add caching overrides later if we introduce ISR.
export default defineCloudflareConfig();

// Deploy trigger: promote hardened middleware + single-use pg pool to production.
