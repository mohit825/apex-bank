import {
  getSimulatedMarketFeed,
  isExpectedMarketFeedError,
} from "@/lib/market-feed";

const updatedAtFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
  timeZoneName: "short",
});

export async function MarketFeedSection() {
  let marketFeed: Awaited<ReturnType<typeof getSimulatedMarketFeed>> | null;

  try {
    marketFeed = await getSimulatedMarketFeed();
  } catch (error) {
    if (!isExpectedMarketFeedError(error)) throw error;
    marketFeed = null;
  }

  return (
    <section
      aria-labelledby="market-feed-heading"
      className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8"
    >
      <h2
        id="market-feed-heading"
        className="text-xl font-semibold tracking-tight sm:text-2xl"
      >
        Market snapshot
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Simulated market data for demonstration only. These are not live quotes.
      </p>

      {marketFeed ? (
        <>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {marketFeed.indices.map((index) => (
              <li
                key={index.name}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-sm font-medium text-slate-600">
                  {index.name}
                </h3>
                <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
                  {index.value}
                </p>
                <p
                  className={`mt-1 text-sm font-medium tabular-nums ${
                    index.movement.startsWith("+")
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {index.movement} simulated movement
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Sample updated{" "}
            <time dateTime={marketFeed.updatedAt.toISOString()}>
              {updatedAtFormatter.format(marketFeed.updatedAt)}
            </time>
          </p>
        </>
      ) : (
        <div role="status" className="mt-6 rounded-xl bg-slate-50 px-5 py-8">
          <p className="font-medium text-slate-900">
            Market data temporarily unavailable
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Please check again later. Your banking information remains available.
          </p>
        </div>
      )}
    </section>
  );
}
