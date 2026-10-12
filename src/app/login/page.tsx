import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | ApexBank",
  description: "Sign in to your ApexBank account.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-8 sm:px-10 sm:py-10">
      <Link
        href="/"
        className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Back
      </Link>

      <section className="my-auto rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12">
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Sign in to ApexBank
        </h1>
        <p className="mt-4 text-center leading-7 text-slate-600">
          Enter your account details below.
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-slate-600">
          New to ApexBank?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
