import { formatPaise } from "./formatting";
import { getInvestmentHoldingsForUser } from "@/lib/dashboard";

export async function InvestmentHoldingsSection({ userId }: { userId: string }) {
  const investmentHoldings = await getInvestmentHoldingsForUser(userId);
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
  );
}
