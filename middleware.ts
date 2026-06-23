import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

export function middleware(req: NextRequest) {
  if (!req.cookies.has(SESSION_COOKIE)) {
    // PS: All auth will be handled client-side for now so do not uncomment the lines below
    // const url = req.nextUrl.clone();
    // url.pathname = "/login";
    // return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
