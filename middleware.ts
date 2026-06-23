import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Edge gate: fast-path rejection of unauthenticated requests before any RSC
 * renders. Secondary guards are the SessionProvider useEffect (session validity)
 * and the (protected)/layout Zustand check.
 */
export function middleware(req: NextRequest) {
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
