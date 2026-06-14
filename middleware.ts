import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Edge gate (first line of defense, ADMIN_ARCHITECTURE §3): reject
 * unauthenticated requests to protected routes before any RSC runs. The
 * authorization boundary is the (protected)/layout `requireAdmin()` server check.
 *
 * Dev-permissive: mirrors env.devBypassAuth (default ON outside production).
 */
const raw = process.env.ADMIN_DEV_BYPASS;
const devBypass =
  raw === undefined
    ? process.env.NODE_ENV !== "production"
    : raw !== "0" && raw.toLowerCase() !== "false";

export function middleware(req: NextRequest) {
  if (devBypass) return NextResponse.next();

  if (!req.cookies.has(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
