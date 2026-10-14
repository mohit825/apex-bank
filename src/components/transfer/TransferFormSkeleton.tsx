export function TransferFormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-full max-w-md rounded bg-slate-100" />
        <div className="h-4 w-48 max-w-full rounded bg-slate-100" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="mt-2 h-12 rounded-lg bg-slate-100" />
          <div className="mt-2 h-4 w-64 max-w-full rounded bg-slate-100" />
        </div>
        <div className="sm:col-span-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-2 h-12 rounded-lg bg-slate-100" />
          <div className="mt-2 h-4 w-72 max-w-full rounded bg-slate-100" />
        </div>
        {["amount", "reference"].map((field) => (
          <div key={field}>
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-12 rounded-lg bg-slate-100" />
            <div className="mt-2 h-4 w-40 max-w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-5">
        <div className="h-12 w-44 max-w-full rounded-full bg-blue-100" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-slate-100" />
      </div>
    </div>
  );
}
