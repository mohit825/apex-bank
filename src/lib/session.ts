import "server-only";

import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import { users } from "@/db/schema";

const COOKIE_NAME = "apexbank_session";
const SESSION_AGE_SECONDS = 2 * 60 * 60;
const ISSUER = "apexbank";
const AUDIENCE = "apexbank-web";
const ALGORITHM = "HS256";

type UserRole = typeof users.$inferSelect.role;

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("JWT_SECRET must be a random secret of at least 32 bytes.");
  }

  return new TextEncoder().encode(secret);
}

/** Call only after authenticating credentials; the role is loaded from the database. */
export async function createSession(userId: string) {
  debugger;
  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("Cannot create a session for a missing user.");
  }

  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(SESSION_AGE_SECONDS + "s")
    .sign(getSecret());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

/** Return verified session claims, or null for a missing or invalid cookie. */
export async function readSession(): Promise<{
  userId: string;
  role: UserRole;
} | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
      issuer: ISSUER,
      audience: AUDIENCE,
      typ: "JWT",
      maxTokenAge: SESSION_AGE_SECONDS,
      requiredClaims: ["sub", "exp", "iat", "role"],
    });

    if (
      typeof payload.sub !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        payload.sub,
      ) ||
      (payload.role !== "CUSTOMER" && payload.role !== "ADMIN")
    ) {
      return null;
    }

    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

/** Call from a future logout Server Action to expire the browser cookie. */
export async function deleteSession() {
  (await cookies()).set(COOKIE_NAME, "", {
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

  return user?.role === session.role ? user : null;
}
