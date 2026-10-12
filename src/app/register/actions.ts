"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db/client";
import { users } from "@/db/schema";

const registrationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z
        .email({ error: "Enter a valid email address." })
        .max(320, { error: "Email address is too long." }),
    ),
  password: z
    .string()
    .min(5, { error: "Use at least 5 characters." })
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
      error: "Use a password no longer than 72 bytes.",
    }),
});

export type RegisterState = {
  errors?: { email?: string; password?: string };
  message?: string;
};

export async function registerUser(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: {
        email: parsed.error.issues.find((issue) => issue.path[0] === "email")
          ?.message,
        password: parsed.error.issues.find(
          (issue) => issue.path[0] === "password",
        )?.message,
      },
    };
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    const inserted = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        passwordHash,
        role: "CUSTOMER",
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    if (inserted.length === 0) {
      return { errors: { email: "This email is already registered." } };
    }
  } catch {
    return { message: "Unable to create your account. Please try again." };
  }

  redirect("/login");
}
