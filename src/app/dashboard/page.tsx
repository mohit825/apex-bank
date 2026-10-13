import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { deleteSession } from "@/lib/session";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dashboard | ApexBank",
};

async function logout() {
  "use server";

  await deleteSession();
  redirect("/login");
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Home
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Log out
          </button>
        </form>
      </div>

      <section className="my-auto rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome to your dashboard
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Your session is verified. You are signed in as {user.email}.
        </p>
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Admin
          </Link>
        )}
      </section>
    </main>
  );
}
