import "server-only";

import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/session";

/** Verify the session and load the current user without the password hash. */
export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return user;
}

/** Require the current database role to be ADMIN. */
export async function requireAdmin() {
  const user = await requireAuthenticatedUser();
  if (user.role !== "ADMIN") redirect("/forbidden");

  return user;
}
