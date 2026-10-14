import { TransferFormSkeleton } from "@/components/transfer/TransferFormSkeleton";

export default function TransferLoading() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p role="status" className="sr-only">Loading transfer form</p>
      <div aria-hidden="true" className="h-5 w-36 rounded bg-slate-200" />
      <h1 className="mt-8 text-3xl font-semibold text-slate-900">Wire Transfer</h1>
      <div className="mt-6">
        <TransferFormSkeleton />
      </div>
    </main>
  );
}
