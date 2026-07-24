"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { siteConfig } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

// prefetch is disabled on nav links: with the database in Mumbai and the
// server in another region, each prefetch is a slow cross-region round trip,
// and prefetching every nav link on load fired a burst that clogged the
// connection. Links still navigate normally on click.

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  // Fetch auth state on the client so marketing pages stay statically rendered.
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" prefetch={false} className="flex items-center gap-2 font-semibold">
          <span
            className="grid size-8 place-items-center rounded-md text-sm font-bold text-white"
            style={{ background: "var(--brand-gradient)" }}
          >
            SF
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
          <span className="sm:hidden">{siteConfig.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {signedIn ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/dashboard" prefetch={false}>Dashboard</Link>
              </Button>
              <form action={logout} className="hidden sm:block">
                <Button type="submit" variant="outline">Log out</Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login" prefetch={false}>Log in</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/pricing" prefetch={false}>Enroll</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("border-t md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Dashboard
              </Link>
              <form action={logout} className="mt-2">
                <Button type="submit" variant="outline" className="w-full">Log out</Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Log in
              </Link>
              <Button asChild className="mt-2 w-full">
                <Link href="/pricing" prefetch={false} onClick={() => setOpen(false)}>Enroll</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
