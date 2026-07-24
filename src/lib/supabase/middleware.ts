import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and syncs the
// refreshed cookies onto the response. Called from the root middleware.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touch the user so an expired token gets refreshed into the cookies.
  // Wrapped in try/catch: on Cloudflare's edge runtime the network call to
  // Supabase Auth can occasionally fail, and we don't want a transient hiccup
  // to crash the whole page — the request can still render, just without
  // refreshing the session this time.
  try {
    await supabase.auth.getUser();
  } catch {
    // Ignore transient auth-refresh failures.
  }

  return response;
}
