import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME, isAccessCookieValid } from "@/lib/paywall";

const gatedRoutes = ["/dashboard", "/upload", "/api/categorize"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiresAccess = gatedRoutes.some((route) => pathname.startsWith(route));

  if (!requiresAccess) {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (isAccessCookieValid(accessCookie)) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(`/unlock?next=${encodeURIComponent(pathname + search)}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/api/categorize"]
};
