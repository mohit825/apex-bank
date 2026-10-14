import Link from "next/link";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { getAccountSummaryForUser } from "@/lib/dashboard";
import { TransferForm } from "@/components/transfer/TransferForm";

export default async function TransferPage() {
  const user = await requireAuthenticatedUser();

  const accounts = await getAccountSummaryForUser(user.id);

  const accountOptions = accounts.map((account) => ({
    id: account.id,
    displayName: account.displayName,
    maskedIdentifier: account.maskedIdentifier,
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard">← Back to dashboard</Link>

      <h1 className="mt-8 text-3xl font-semibold">Wire Transfer</h1>

      <div className="mt-6">
        <TransferForm accounts={accountOptions} />
      </div>
    </main>
  );
}
