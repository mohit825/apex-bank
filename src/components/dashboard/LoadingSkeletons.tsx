export function AccountSummarySkeleton() {
  return (
    <section role="status" className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Your accounts
      </h2>
      <span className="sr-only">Loading account summary</span>
      <div aria-hidden="true">
        <div className="mt-5 rounded-2xl bg-blue-100 px-6 py-8 sm:px-8">
          <div className="h-4 w-44 rounded bg-blue-200" />
          <div className="mt-4 h-9 w-52 max-w-full rounded bg-blue-200" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-24 rounded bg-slate-100" />
              <div className="mt-8 h-7 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <section
      role="status"
      className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8"
    >
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Recent transactions
      </h2>
      <span className="sr-only">Loading recent transactions</span>
      <div aria-hidden="true">
        <div className="mt-2 h-4 w-56 max-w-full rounded bg-slate-100" />
        <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-5 w-40 max-w-full rounded bg-slate-200" />
                <div className="mt-2 h-4 w-28 rounded bg-slate-100" />
              </div>
              <div className="h-6 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InvestmentHoldingsSkeleton() {
  return (
    <section role="status" className="mt-8 pb-8">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Investment holdings
      </h2>
      <span className="sr-only">Loading investment holdings</span>
      <div aria-hidden="true">
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="mt-3 h-7 w-32 max-w-full rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="mt-7 h-6 w-28 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketFeedSkeleton() {
  return (
    <section
      role="status"
      className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8"
    >
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Market snapshot
      </h2>
      <span className="sr-only">Loading simulated market data</span>
      <div aria-hidden="true">
        <div className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-32 rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-28 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
