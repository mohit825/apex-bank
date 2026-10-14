import {
  AccountSummarySkeleton,
  InvestmentHoldingsSkeleton,
  MarketFeedSkeleton,
  RecentTransactionsSkeleton,
} from "@/components/dashboard/LoadingSkeletons";

export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8 sm:px-10 sm:py-10">
      <p role="status" className="sr-only">Loading dashboard</p>
      <div aria-hidden="true">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="h-10 w-20 rounded-full bg-slate-200" />
          <div className="h-12 w-40 rounded-lg bg-blue-100" />
          <div className="h-10 w-24 rounded-full bg-slate-200" />
        </div>

        <div className="mt-10 space-y-3">
          <div className="h-4 w-40 rounded bg-blue-100" />
          <div className="h-10 w-64 max-w-full rounded bg-slate-200" />
          <div className="h-5 w-52 max-w-full rounded bg-slate-100" />
        </div>

        <AccountSummarySkeleton />
        <RecentTransactionsSkeleton />
        <InvestmentHoldingsSkeleton />
        <MarketFeedSkeleton />
      </div>
    </main>
  );
}
