// src/proxy.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth/jwt";
import { TRANSFER_RETURN_PATH } from "./lib/auth/return-path";

export async function proxy(request: NextRequest) {
  // 1. Read the JWT string from the cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  // 2. Verify its signature and claims
  const session = token ? await verifySessionToken(token) : null;

  const pathName = request.nextUrl.pathname;

  // 3. Reject requests without a valid session. Server Action POSTs also pass
  // through Proxy; use 303 so their bodies are never reposted to /login.
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    if (pathName === TRANSFER_RETURN_PATH) {
      loginUrl.searchParams.set("returnTo", TRANSFER_RETURN_PATH);
    }
    return NextResponse.redirect(loginUrl, {
      status: request.method === "POST" ? 303 : 307,
    });
  }

  // TODO: Your role-based authorization checks
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
