import assert from "node:assert/strict";
import { test } from "node:test";

import { SignJWT } from "jose";
import { NextRequest } from "next/server";

import { proxy } from "../src/proxy";

const secret = "admin-access-test-secret-at-least-32-bytes";
process.env.JWT_SECRET = secret;

async function sessionCookie(role: "ADMIN" | "CUSTOMER") {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject("11111111-1111-4111-8111-111111111111")
    .setIssuer("apexbank")
    .setAudience("apexbank-web")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));

  return `apexbank_session=${token}`;
}

test("Proxy denies unauthenticated and CUSTOMER access to /admin", async () => {
  const unauthenticated = await proxy(new NextRequest("http://localhost:3003/admin"));
  assert.equal(unauthenticated.status, 307);
  assert.equal(new URL(unauthenticated.headers.get("location") ?? "").pathname, "/login");

  const customer = await proxy(
    new NextRequest("http://localhost:3003/admin", {
      headers: { Cookie: await sessionCookie("CUSTOMER") },
    }),
  );
  assert.equal(customer.status, 307);
  assert.equal(new URL(customer.headers.get("location") ?? "").pathname, "/forbidden");
});

test("Proxy lets a valid ADMIN JWT proceed to the server role check", async () => {
  const admin = await proxy(
    new NextRequest("http://localhost:3003/admin", {
      headers: { Cookie: await sessionCookie("ADMIN") },
    }),
  );

  assert.equal(admin.status, 200);
  assert.equal(admin.headers.get("x-middleware-next"), "1");
});
