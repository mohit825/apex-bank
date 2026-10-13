import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access denied | ApexBank",
};

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16 sm:px-10">
      <section className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Access denied
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          You do not have permission to view this page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
