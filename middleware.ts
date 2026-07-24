import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (err) {
    // Last-resort guard: never let the middleware layer crash a request.
    console.error(
      "[middleware] error:",
      err instanceof Error ? `${err.name}: ${err.message}\n${err.stack ?? ""}` : String(err)
    );
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and images:
     * - _next/static, _next/image
     * - favicon and common image extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
