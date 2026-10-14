export default function AdminLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 sm:px-10 sm:py-10">
      <p role="status" className="sr-only">Loading administration dashboard</p>
      <div aria-hidden="true">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="h-10 w-28 rounded-full bg-slate-200" />
          <div className="h-10 w-24 rounded-full bg-slate-200" />
        </div>

        <div className="mt-10 space-y-3">
          <div className="h-4 w-32 rounded bg-blue-100" />
          <div className="h-10 w-80 max-w-full rounded bg-slate-200" />
          <div className="h-5 w-52 max-w-full rounded bg-slate-100" />
        </div>

        <section className="mt-10">
          <div className="h-7 w-64 max-w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-full max-w-lg rounded bg-slate-100" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="mt-4 h-8 w-36 max-w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="h-7 w-60 max-w-full rounded bg-slate-200" />
          <div className="mt-4 h-8 w-40 rounded-full bg-slate-100" />
          <div className="mt-4 h-4 w-full max-w-xl rounded bg-slate-100" />
        </section>

        <section className="mt-10 pb-10">
          <div className="h-7 w-64 max-w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-80 max-w-full rounded bg-slate-100" />
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="min-w-[900px] divide-y divide-slate-100">
              <div className="flex gap-8 bg-slate-50 px-5 py-4">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-4 w-28 rounded bg-slate-200" />
                ))}
              </div>
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex gap-8 px-5 py-5">
                  {[0, 1, 2, 3, 4, 5].map((column) => (
                    <div key={column} className="h-5 w-28 rounded bg-slate-100" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
