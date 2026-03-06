import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// TEMP: DEVELOPMENT SITE PROTECTION – remove before production launch
export async function middleware(request: NextRequest) {
  // Only apply if SITE_LOCK is true (handled inside updateSession but also good to check here for other logic)
  if (process.env.SITE_LOCK === "true") {
    return await updateSession(request);
  }
  // If not locked, just return normal response (or continue chain if we had other middleware)
  // But since updateSession handles cookie syncing which is good for auth in general, we might want to run it anyway?
  // The user said: "If SITE_LOCK=false → the middleware does nothing and the site is public."
  // So we simply do nothing.
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
