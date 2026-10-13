import { jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "apexbank_session";
export const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60;
export const SESSION_ISSUER = "apexbank";
export const SESSION_AUDIENCE = "apexbank-web";
export const SESSION_ALGORITHM = "HS256";

export type VerifiedSession = {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be a random secret of at least 32 bytes.");
  }

  const bytes = new TextEncoder().encode(secret);
  if (bytes.length < 32) {
    throw new Error("JWT_SECRET must be a random secret of at least 32 bytes.");
  }

  return bytes;
}

/** Verify a signed session token without any database or request dependency. */
export async function verifySessionToken(
  token: string,
): Promise<VerifiedSession | null> {
  if (!token) return null;

  const secret = getJwtSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [SESSION_ALGORITHM],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      typ: "JWT",
      maxTokenAge: SESSION_MAX_AGE_SECONDS,
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
