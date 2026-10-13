import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { deleteSession } from "@/lib/session";
import {
  getAccountSummaryForUser,
  getInvestmentHoldingsForUser,
  getRecentTransactionsForUser,
} from "@/lib/dashboard";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dashboard | ApexBank",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function formatPaise(amountPaise: bigint) {
  const rupees = amountPaise / BigInt(100);
  const paise = amountPaise % BigInt(100);

  return currencyFormatter
    .formatToParts(rupees)
    .map((part) =>
      part.type === "fraction" ? paise.toString().padStart(2, "0") : part.value,
    )
    .join("");
}

async function logout() {
  "use server";

  await deleteSession();
  redirect("/login");
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  const [summary, transaction, investmentHoldings] = await Promise.all([
    getAccountSummaryForUser(user.id),
    getRecentTransactionsForUser(user.id),
    getInvestmentHoldingsForUser(user.id),
  ]);

  const totalBalancePaise = summary.reduce(
    (total, account) => total + account.balancePaise,
    BigInt(0),
  );
  const totalInvestedPaise = investmentHoldings.reduce(
    (total, holding) => total + holding.investedPaise,
    BigInt(0),
  );
  const totalValuationPaise = investmentHoldings.reduce(
    (total, holding) => total + holding.valuationPaise,
    BigInt(0),
  );
  const investmentChangePaise = totalValuationPaise - totalInvestedPaise;
  const isInvestmentLoss = investmentChangePaise < BigInt(0);

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
            <p className="font-medium text-slate-900">
              No accounts to show yet.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Your account balances will appear here when available.
            </p>
          </div>
        )}
      </section>

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
                        {dateFormatter.format(item.createdAt)}
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

      <section aria-labelledby="investments-heading" className="mt-8 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2
            id="investments-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Investment holdings
          </h2>
          {investmentHoldings.length > 0 && (
            <p className="text-sm text-slate-500">
              {investmentHoldings.length}{" "}
              {investmentHoldings.length === 1 ? "holding" : "holdings"}
            </p>
          )}
        </div>

        {investmentHoldings.length > 0 ? (
          <>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <dt className="text-sm text-slate-600">Total invested</dt>
                <dd className="mt-2 break-words text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
                  {formatPaise(totalInvestedPaise)}
                </dd>
              </div>
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <dt className="text-sm text-slate-600">Current value</dt>
                <dd className="mt-2 break-words text-2xl font-semibold tracking-tight tabular-nums text-blue-700">
                  {formatPaise(totalValuationPaise)}
                </dd>
              </div>
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <dt className="text-sm text-slate-600">
                  {isInvestmentLoss
                    ? "Overall loss"
                    : investmentChangePaise > BigInt(0)
                      ? "Overall gain"
                      : "Overall change"}
                </dt>
                <dd
                  className={`mt-2 break-words text-2xl font-semibold tracking-tight tabular-nums ${
                    isInvestmentLoss
                      ? "text-rose-700"
                      : investmentChangePaise > BigInt(0)
                        ? "text-emerald-700"
                        : "text-slate-900"
                  }`}
                >
                  {isInvestmentLoss ? "−" : investmentChangePaise > BigInt(0) ? "+" : ""}
                  {formatPaise(
                    isInvestmentLoss ? -investmentChangePaise : investmentChangePaise,
                  )}
                </dd>
              </div>
            </dl>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {investmentHoldings.map((holding) => (
                <li
                  key={holding.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900">
                    {holding.productName}
                  </h3>
                  <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-sm text-slate-600">Invested</dt>
                      <dd className="mt-1 break-words font-semibold tabular-nums text-slate-900">
                        {formatPaise(holding.investedPaise)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-sm text-slate-600">Current value</dt>
                      <dd className="mt-1 break-words font-semibold tabular-nums text-blue-700">
                        {formatPaise(holding.valuationPaise)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="font-medium text-slate-900">
              No investment holdings to show yet.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Your investments will appear here when available.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
