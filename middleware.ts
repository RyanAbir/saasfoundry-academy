import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /*
   * Only run where a session actually matters. updateSession() calls
   * supabase.auth.getUser(), which is a network round trip to Supabase — doing
   * that on the marketing pages costs every visitor hundreds of milliseconds
   * for a session they don't have. Tokens still refresh the moment someone
   * touches an authenticated route.
   */
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/admin/:path*",
    "/enroll/:path*",
    "/checkout/:path*",
    "/login",
    "/signup",
    "/auth/:path*",
  ],
};
