import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and syncs the
// refreshed cookies onto the response. Fully wrapped so that ANY failure here
// (a transient network call to Supabase Auth on the edge, a cookie edge case,
// etc.) is logged with its real message and never crashes the page — we fall
// through to a normal response instead.
export async function updateSession(request: NextRequest) {
  try {
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
    await supabase.auth.getUser();

    return response;
  } catch (err) {
    // Surface the REAL error in Cloudflare's logs (the framework otherwise
    // reports a minified "Error in routingHandler"), and keep the page alive.
    console.error(
      "[updateSession] middleware error:",
      err instanceof Error
        ? `${err.name}: ${err.message}\n${err.stack ?? ""}`
        : String(err)
    );
    return NextResponse.next({ request });
  }
}
