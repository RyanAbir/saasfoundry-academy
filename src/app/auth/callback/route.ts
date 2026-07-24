import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

// OAuth / email-confirmation callback: exchange the code for a session,
// sync the app User, then redirect into the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await getCurrentUser(); // create/link the app User row
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=Sign-in%20failed`);
}
