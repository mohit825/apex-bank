import { dashboardDateFormatter, formatPaise } from "./formatting";
import { getRecentTransactionsForUser } from "@/lib/dashboard";

export async function RecentTransactionsSection({ userId }: { userId: string }) {
  const transaction = await getRecentTransactionsForUser(userId);

  return (
    <section
      aria-labelledby="transactions-heading"
      className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8"
    >
      <h2
        id="transactions-heading"
        className="text-xl font-semibold tracking-tight sm:text-2xl"
      >
        Recent transactions
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Your five most recent account transactions.
      </p>

      {transaction.length > 0 ? (
        <ul className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
          {transaction.map((item) => {
            const isCredit = item.direction === "CREDIT";

            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-slate-900">
                      {item.description}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isCredit ? "Credit" : "Debit"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.accountDisplayName} ·{" "}
                    <time dateTime={item.createdAt.toISOString()}>
                      {dashboardDateFormatter.format(item.createdAt)}
                    </time>
                  </p>
                </div>
                <p
                  className={`shrink-0 break-words text-lg font-semibold tabular-nums ${
                    isCredit ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {isCredit ? "+" : "−"}
                  {formatPaise(item.amountPaise)}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl bg-slate-50 px-5 py-8 text-center">
          <p className="font-medium text-slate-900">
            No transactions to show yet.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Recent account activity will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
