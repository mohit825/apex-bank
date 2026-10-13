import "server-only";

import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import {
  getJwtSecret,
  SESSION_ALGORITHM,
  SESSION_AUDIENCE,
  SESSION_COOKIE_NAME,
  SESSION_ISSUER,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "@/lib/auth/jwt";

/** Call only after authenticating credentials; the role is loaded from the database. */
export async function createSession(userId: string) {
  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("Cannot create a session for a missing user.");
  }

  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: SESSION_ALGORITHM, typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(SESSION_MAX_AGE_SECONDS + "s")
    .sign(getJwtSecret());

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Return verified session claims, or null for a missing or invalid cookie. */
export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

/** Expire the browser cookie; this does not revoke a copied JWT. */
export async function deleteSession() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Verify the JWT and load a current user without selecting the password hash. */
export async function getAuthenticatedUser() {
  const session = await readSession();
  if (!session) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  // The current database role is authoritative if the signed JWT role is stale.
  return user ?? null;
}
