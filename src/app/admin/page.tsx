import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";
import { formatPaise } from "@/components/dashboard/formatting";
import { getAdminDashboardData } from "@/lib/admin";
import { deleteSession } from "@/lib/session";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Administration | ApexBank",
};

const countFormatter = new Intl.NumberFormat("en-IN");
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
  timeZoneName: "short",
});

async function logout() {
  "use server";

  await deleteSession();
  redirect("/login");
}

export default async function AdminPage() {
  const admin = await requireAdmin();
  const monitoring = await getAdminDashboardData();
  const data = monitoring.data;

  const summary = data
    ? [
        { label: "Registered customers", value: countFormatter.format(data.customerCount) },
        { label: "Successful transfers", value: countFormatter.format(data.transferMetrics.totalCount) },
        { label: "Transfers in last 24 hours", value: countFormatter.format(data.transferMetrics.last24HoursCount) },
        { label: "Total transferred", value: formatPaise(data.transferMetrics.totalAmountPaise) },
      ]
    : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 sm:px-10 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Dashboard
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

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          ApexBank Administration
        </h1>
        <p className="mt-3 break-all text-sm text-slate-600 sm:text-base">
          Signed in as {admin.email}.
        </p>
      </div>

      <section aria-labelledby="overview-heading" className="mt-10">
        <h2 id="overview-heading" className="text-xl font-semibold text-slate-900">
          Banking activity overview
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Counts and amounts reflect successful simulated transfers recorded in the database.
        </p>

        {data ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <dt className="text-sm font-medium text-slate-600">{item.label}</dt>
                <dd className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Activity figures are temporarily unavailable. Please try again later.
          </p>
        )}
      </section>

      <section aria-labelledby="monitoring-heading" className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="monitoring-heading" className="text-xl font-semibold text-slate-900">
          Application Monitoring
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            monitoring.databaseAvailable
              ? "bg-green-50 text-green-800"
              : "bg-amber-50 text-amber-900"
          }`}>
            Database query {monitoring.databaseAvailable ? "available" : "unavailable"}
          </span>
          <span className="text-sm text-slate-600">
            Checked <time dateTime={monitoring.checkedAt.toISOString()}>{dateTimeFormatter.format(monitoring.checkedAt)}</time>
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {monitoring.databaseAvailable
            ? "The application reached PostgreSQL when this page loaded. This is a point-in-time query check, not continuous uptime monitoring."
            : "The application could not reach PostgreSQL for this check. Activity data is temporarily unavailable."}
        </p>
        {data && (
          <p className="mt-2 text-sm text-slate-600">
            Successful simulated transfers in the last 24 hours: {countFormatter.format(data.transferMetrics.last24HoursCount)}.
          </p>
        )}
        {monitoring.databaseAvailable && !data && (
          <p className="mt-2 text-sm text-amber-800">
            The connection check succeeded, but activity queries could not be completed.
          </p>
        )}
      </section>

      <section aria-labelledby="transfers-heading" className="mt-10 pb-10">
        <h2 id="transfers-heading" className="text-xl font-semibold text-slate-900">
          Recent Transfer Activity
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          The 20 most recent successful simulated transfers, newest first.
        </p>

        {!data ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Recent transfer activity is temporarily unavailable.
          </p>
        ) : data.recentTransfers.length === 0 ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No successful simulated transfers have been recorded yet.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <caption className="sr-only">Recent successful simulated wire transfers</caption>
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">Date and time</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Customer</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Source account</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Recipient</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">Amount (INR)</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Transfer ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentTransfers.map((transfer) => (
                  <tr key={transfer.id} className="align-top">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      <time dateTime={transfer.createdAt.toISOString()}>{dateTimeFormatter.format(transfer.createdAt)}</time>
                    </td>
                    <td className="max-w-52 break-all px-5 py-4 text-slate-900">{transfer.customerEmail}</td>
                    <td className="px-5 py-4 text-slate-700">
                      <span className="block font-medium text-slate-900">{transfer.sourceAccountName}</span>
                      <span className="block text-slate-500">{transfer.sourceAccountMaskedIdentifier}</span>
                    </td>
                    <td className="max-w-48 break-all px-5 py-4 text-slate-700">{transfer.recipientIdentifier}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-slate-900">{formatPaise(transfer.amountPaise)}</td>
                    <td className="break-all px-5 py-4 font-mono text-xs text-slate-600">{transfer.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
