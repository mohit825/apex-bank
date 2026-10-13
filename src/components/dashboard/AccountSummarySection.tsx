import { formatPaise } from "./formatting";
import { getAccountSummaryForUser } from "@/lib/dashboard";

export async function AccountSummarySection({ userId }: { userId: string }) {
  const summary = await getAccountSummaryForUser(userId);
  const totalBalancePaise = summary.reduce(
    (total, account) => total + account.balancePaise,
    BigInt(0),
  );

  return (
    <section aria-labelledby="accounts-heading" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id="accounts-heading"
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Your accounts
        </h2>
        {summary.length > 0 && (
          <p className="text-sm text-slate-500">
            {summary.length} {summary.length === 1 ? "account" : "accounts"}
          </p>
        )}
      </div>

      {summary.length > 0 ? (
        <>
          <div className="mt-5 rounded-2xl bg-blue-700 px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
            <p className="text-sm font-medium text-blue-100">
              Total balance across your accounts
            </p>
            <p className="mt-3 break-words text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {formatPaise(totalBalancePaise)}
            </p>
          </div>

          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {summary.map((account) => (
              <li
                key={account.id}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">
                  {account.displayName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {account.maskedIdentifier}
                </p>
                <p className="mt-6 text-sm text-slate-600">Current balance</p>
                <p className="mt-1 break-words text-2xl font-semibold tracking-tight tabular-nums text-blue-700">
                  {formatPaise(account.balancePaise)}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="font-medium text-slate-900">No accounts to show yet.</p>
          <p className="mt-2 text-sm text-slate-600">
            Your account balances will appear here when available.
          </p>
        </div>
      )}
    </section>
  );
}
