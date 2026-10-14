import assert from "node:assert/strict";
import { test } from "node:test";

import { SignJWT } from "jose";
import { NextRequest } from "next/server";

import { safePostLoginPath } from "../src/lib/auth/return-path";
import {
  canRestoreTransferDraft,
  parseTransferDraft,
  TRANSFER_DRAFT_MAX_AGE_MS,
  type TransferDraft,
} from "../src/lib/transfer-draft";
import { proxy } from "../src/proxy";

const customerId = "11111111-1111-4111-8111-111111111111";
const otherCustomerId = "22222222-2222-4222-8222-222222222222";
const accountId = "33333333-3333-4333-8333-333333333333";
const key = "44444444-4444-4444-8444-444444444444";

function draftAt(savedAt: number): TransferDraft {
  return {
    sourceAccountId: accountId,
    recipientIdentifier: "RECIPIENT-123",
    amountInr: "125.50",
    paymentReference: "Rent",
    idempotencyKey: key,
    customerId,
    savedAt,
  };
}

test("draft restoration requires the same customer and a current source account", () => {
  const draft = draftAt(Date.now());
  assert.deepEqual(parseTransferDraft(JSON.stringify(draft)), draft);
  assert.equal(canRestoreTransferDraft(draft, customerId, [accountId]), true);
  assert.equal(canRestoreTransferDraft(draft, otherCustomerId, [accountId]), false);
  assert.equal(canRestoreTransferDraft(draft, customerId, []), false);
});

test("expired and malformed drafts are rejected", () => {
  const now = Date.now();
  assert.equal(
    parseTransferDraft(JSON.stringify(draftAt(now - TRANSFER_DRAFT_MAX_AGE_MS - 1)), now),
    null,
  );
  assert.equal(parseTransferDraft("{broken", now), null);
  assert.equal(parseTransferDraft(JSON.stringify({ ...draftAt(now), idempotencyKey: "bad" }), now), null);
});

test("post-login navigation accepts only the transfer path", () => {
  assert.equal(safePostLoginPath("/dashboard/transfer"), "/dashboard/transfer");
  assert.equal(safePostLoginPath("https://example.com"), "/dashboard");
  assert.equal(safePostLoginPath("//example.com"), "/dashboard");
  assert.equal(safePostLoginPath(["/dashboard/transfer"]), "/dashboard");
});

test("Proxy redirects an expired transfer POST as GET and preserves only the allowed return path", async () => {
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-bytes-long";
  const now = Math.floor(Date.now() / 1000);
  const expiredToken = await new SignJWT({ role: "CUSTOMER" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(customerId)
    .setIssuer("apexbank")
    .setAudience("apexbank-web")
    .setIssuedAt(now - 60)
    .setExpirationTime(now - 1)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const response = await proxy(
    new NextRequest("http://localhost:3003/dashboard/transfer", {
      method: "POST",
      headers: { Cookie: `apexbank_session=${expiredToken}` },
    }),
  );

  assert.equal(response.status, 303);
  const location = new URL(response.headers.get("location") ?? "");
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("returnTo"), "/dashboard/transfer");
});

test("Proxy ignores a supplied return URL and redirects a missing session safely", async () => {
  const response = await proxy(
    new NextRequest("http://localhost:3003/dashboard/transfer?returnTo=//example.com"),
  );

  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location") ?? "");
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("returnTo"), "/dashboard/transfer");
});
