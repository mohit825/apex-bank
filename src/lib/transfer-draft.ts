export const TRANSFER_DRAFT_STORAGE_KEY = "apexbank.transfer-draft.v1";
export const TRANSFER_DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type TransferDraft = {
  sourceAccountId: string;
  recipientIdentifier: string;
  amountInr: string;
  paymentReference: string;
  idempotencyKey: string;
  customerId: string;
  savedAt: number;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseTransferDraft(raw: string | null, now = Date.now()): TransferDraft | null {
  if (!raw || raw.length > 2_000) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;

    const draft = value as Record<string, unknown>;
    if (
      typeof draft.customerId !== "string" ||
      !uuidPattern.test(draft.customerId) ||
      typeof draft.idempotencyKey !== "string" ||
      !uuidPattern.test(draft.idempotencyKey) ||
      typeof draft.sourceAccountId !== "string" ||
      (draft.sourceAccountId !== "" && !uuidPattern.test(draft.sourceAccountId)) ||
      typeof draft.recipientIdentifier !== "string" ||
      draft.recipientIdentifier.length > 100 ||
      typeof draft.amountInr !== "string" ||
      draft.amountInr.length > 32 ||
      typeof draft.paymentReference !== "string" ||
      draft.paymentReference.length > 140 ||
      typeof draft.savedAt !== "number" ||
      !Number.isSafeInteger(draft.savedAt) ||
      draft.savedAt > now + 5 * 60 * 1000 ||
      now - draft.savedAt > TRANSFER_DRAFT_MAX_AGE_MS
    ) {
      return null;
    }

    return {
      sourceAccountId: draft.sourceAccountId,
      recipientIdentifier: draft.recipientIdentifier,
      amountInr: draft.amountInr,
      paymentReference: draft.paymentReference,
      idempotencyKey: draft.idempotencyKey,
      customerId: draft.customerId,
      savedAt: draft.savedAt,
    };
  } catch {
    return null;
  }
}

export function canRestoreTransferDraft(
  draft: TransferDraft,
  customerId: string,
  accountIds: readonly string[],
) {
  return (
    draft.customerId === customerId &&
    (draft.sourceAccountId === "" || accountIds.includes(draft.sourceAccountId))
  );
}
