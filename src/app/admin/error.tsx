"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10 sm:px-10">
      <section role="alert" className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Administration is temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          We could not load this page. Please try again shortly.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
