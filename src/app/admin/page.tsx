import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/authorization";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Administration | ApexBank",
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8 sm:px-10 sm:py-10">
      <Link
        href="/dashboard"
        className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Dashboard
      </Link>

      <section className="my-auto rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          ApexBank Administration
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Signed in as {admin.email}.
        </p>
      </section>
    </main>
  );
}
