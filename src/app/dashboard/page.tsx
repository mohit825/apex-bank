import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccountSummarySection } from "@/components/dashboard/AccountSummarySection";
import { InvestmentHoldingsSection } from "@/components/dashboard/InvestmentHoldingsSection";
import {
  AccountSummarySkeleton,
  InvestmentHoldingsSkeleton,
  MarketFeedSkeleton,
  RecentTransactionsSkeleton,
} from "@/components/dashboard/LoadingSkeletons";
import { MarketFeedSection } from "@/components/dashboard/MarketFeedSection";
import { RecentTransactionsSection } from "@/components/dashboard/RecentTransactionsSection";
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
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
      </header>

      <div className="mt-10 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Account overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your dashboard
          </h1>
          <p className="mt-3 break-all text-sm text-slate-600 sm:text-base">
            Signed in as {user.email}
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Admin
          </Link>
        )}
      </div>

      <Suspense fallback={<AccountSummarySkeleton />}>
        <AccountSummarySection userId={user.id} />
      </Suspense>
      <Suspense fallback={<RecentTransactionsSkeleton />}>
        <RecentTransactionsSection userId={user.id} />
      </Suspense>
      <Suspense fallback={<InvestmentHoldingsSkeleton />}>
        <InvestmentHoldingsSection userId={user.id} />
      </Suspense>
      <Suspense fallback={<MarketFeedSkeleton />}>
        <MarketFeedSection />
      </Suspense>
    </main>
  );
}
