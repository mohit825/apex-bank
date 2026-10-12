import Link from "next/link";

import { getActiveRatePlans } from "@/lib/rate-plans";
import { connection } from "next/server";

export default async function Rates() {
  await connection();
  const data = await getActiveRatePlans();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-8 sm:px-10 sm:py-10">
      <Link
        href="/"
        className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Back
      </Link>

      <section
        aria-labelledby="rates-heading"
        className="my-auto rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 sm:py-12"
      >
        <div className="text-center">
          <h1
            id="rates-heading"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            ApexBank Interest Rates
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            Explore our available plans and compare their annual interest rates.
          </p>
        </div>

        {data.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.map((plan) => (
              <li
                key={plan.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h2>
                <p className="mt-6 text-sm font-medium text-slate-600">
                  Annual interest rate
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-blue-700 sm:text-4xl">
                  {(plan.annualRateBasisPoints / 100).toFixed(2)}%
                </p>
                <p className="mt-1 text-sm text-slate-500">per year</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
            <p className="font-medium text-slate-900">
              No rate plans are available right now.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Please check back later for current rates.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
