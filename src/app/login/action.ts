"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = { message?: string };

const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address." })),

  password: z.string().min(1),
});

export async function loginUserAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { message: "Invalid email or password." };
  }

  try {
    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
      return { message: "Invalid email or password." };
    }

    await createSession(user.id);
  } catch {
    return { message: "Unable to sign in right now. Please try again." };
  }

  redirect("/dashboard");
}
