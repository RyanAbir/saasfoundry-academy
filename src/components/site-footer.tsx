import Link from "next/link";

import { siteConfig, tracks } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <span
              className="grid size-8 place-items-center rounded-md text-sm font-bold text-white"
              style={{ background: "var(--brand-gradient)" }}
            >
              SF
            </span>
            {siteConfig.name}
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {siteConfig.tagline} Built for developers in Bangladesh, with local
            payments in BDT.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Tracks</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {tracks.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/courses/${t.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/refund" className="transition-colors hover:text-foreground">
                Refunds
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
