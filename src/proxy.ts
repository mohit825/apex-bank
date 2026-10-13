// src/proxy.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth/jwt";

export async function proxy(request: NextRequest) {
  // 1. Read the JWT string from the cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  // 2. Verify its signature and claims
  const session = token ? await verifySessionToken(token) : null;

  // 3. Reject requests without a valid session
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // TODO: Your role-based authorization checks
  const pathName = request.nextUrl.pathname;
  const isAdminRoute = pathName === "/admin" || pathName.startsWith("/admin/");
  if (session.role !== "ADMIN" && isAdminRoute) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  // 4. Allow an authenticated request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
