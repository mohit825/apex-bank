import { TransferFormSkeleton } from "@/components/transfer/TransferFormSkeleton";
import { TransferModal } from "@/components/transfer/TransferModal";

export default function InterceptedTransferLoading() {
  return (
    <TransferModal>
      <p role="status" className="sr-only">Loading transfer form</p>
      <TransferFormSkeleton />
    </TransferModal>
  );
}
