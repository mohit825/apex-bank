import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { getAccountSummaryForUser } from "@/lib/dashboard";
import { TransferForm } from "@/components/transfer/TransferForm";
import { TransferModal } from "@/components/transfer/TransferModal";

export default async function InterceptedTransferPage() {
  const user = await requireAuthenticatedUser();

  const accounts = await getAccountSummaryForUser(user.id);

  const accountOptions = accounts.map((account) => ({
    id: account.id,
    displayName: account.displayName,
    maskedIdentifier: account.maskedIdentifier,
  }));

  return (
    <TransferModal>
      <TransferForm accounts={accountOptions} />
    </TransferModal>
  );
}
