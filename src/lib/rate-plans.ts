import { db } from "@/db/client";
import { ratePlans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveRatePlans() {
  const activePlans = await db
    .select()
    .from(ratePlans)
    .where(eq(ratePlans.isActive, true));

  return activePlans;
}
