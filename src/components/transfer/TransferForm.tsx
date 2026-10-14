"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  submitTransfer,
  type TransferActionState,
} from "@/app/dashboard/transfer/action";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { TRANSFER_LOGIN_PATH } from "@/lib/auth/return-path";
import {
  canRestoreTransferDraft,
  parseTransferDraft,
  TRANSFER_DRAFT_STORAGE_KEY,
  type TransferDraft,
} from "@/lib/transfer-draft";

export type TransferSourceAccount = {
  id: string;
  displayName: string;
  maskedIdentifier: string;
};

type TransferFormProps = {
  accounts: TransferSourceAccount[];
  customerId: string;
  initialIdempotencyKey: string;
};

const initialState: TransferActionState = {
  status: "idle",
  message: "",
};

type TransferFields = Pick<
  TransferDraft,
  "sourceAccountId" | "recipientIdentifier" | "amountInr" | "paymentReference"
>;

async function checkSession(): Promise<boolean | null> {
  try {
    const response = await fetch("/api/session-status", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (response.status === 200) return true;
    if (response.status === 401) return false;
  } catch {
    // A network error is different from an expired session.
  }
  return null;
}

function writeDraft(customerId: string, fields: TransferFields, idempotencyKey: string) {
  try {
    sessionStorage.setItem(
      TRANSFER_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...fields, idempotencyKey, customerId, savedAt: Date.now() }),
    );
    return true;
  } catch {
    return false;
  }
}

function clearMatchingDraft(customerId: string, idempotencyKey: string) {
  try {
    const raw = sessionStorage.getItem(TRANSFER_DRAFT_STORAGE_KEY);
    const draft = parseTransferDraft(raw);
    if (raw !== null && !draft) {
      sessionStorage.removeItem(TRANSFER_DRAFT_STORAGE_KEY);
      return;
    }
    if (draft?.customerId === customerId && draft.idempotencyKey === idempotencyKey) {
      sessionStorage.removeItem(TRANSFER_DRAFT_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export function TransferForm({
  accounts,
  customerId,
  initialIdempotencyKey,
}: TransferFormProps) {
  const id = useId();
  const router = useRouter();

  const hasAccounts = accounts.length > 0;

  // Keep the same key for retries of this intended transfer.
  const [idempotencyKey, setIdempotencyKey] = useState(initialIdempotencyKey);

  const [draftReady, setDraftReady] = useState(false);
  const [availableDraft, setAvailableDraft] = useState<TransferDraft | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const loadedCustomerRef = useRef<string | null>(null);

  // React manages the Server Action result and pending status.
  const [state, formAction, pending] = useActionState(
    async (previousState: TransferActionState, formData: FormData): Promise<TransferActionState> => {
      const session = await checkSession();
      if (session === false) {
        router.replace(TRANSFER_LOGIN_PATH);
        return { status: "auth-expired", message: "Your session expired. Sign in to continue." };
      }
      if (session === null) {
        return { status: "error", message: "Could not verify your session. Please try again." };
      }

      try {
        const result = await submitTransfer(previousState, formData);
        if (result.status === "auth-expired") {
          router.replace(TRANSFER_LOGIN_PATH);
        } else if (result.status === "success") {
          clearMatchingDraft(customerId, String(formData.get("idempotencyKey")));
        }
        return result;
      } catch {
        // Proxy can reject the POST before the Server Action executes. Check
        // again to distinguish an expired session from a network failure.
        if ((await checkSession()) === false) {
          router.replace(TRANSFER_LOGIN_PATH);
          return { status: "auth-expired", message: "Your session expired. Sign in to continue." };
        }
        return {
          status: "error",
          message: "Could not confirm the transfer. Retry the same request without changing its details.",
        };
      }
    },
    initialState,
  );

  // Keep user-entered values after server validation errors.
  const [formValues, setFormValues] = useState({
    sourceAccountId: "",
    recipientIdentifier: "",
    amountInr: "",
    paymentReference: "",
  });

  useEffect(() => {
    if (loadedCustomerRef.current === customerId) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      loadedCustomerRef.current = customerId;

      try {
        const raw = sessionStorage.getItem(TRANSFER_DRAFT_STORAGE_KEY);
        const draft = parseTransferDraft(raw);

        if (raw !== null && !draft) {
          sessionStorage.removeItem(TRANSFER_DRAFT_STORAGE_KEY);
        } else if (draft?.customerId === customerId) {
          if (canRestoreTransferDraft(draft, customerId, accounts.map((account) => account.id))) {
            setAvailableDraft(draft);
          } else {
            sessionStorage.removeItem(TRANSFER_DRAFT_STORAGE_KEY);
          }
        }
      } catch {
        setStorageUnavailable(true);
      }
      setDraftReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [accounts, customerId]);

  useEffect(() => {
    if (!draftReady || availableDraft || state.status === "success") return;
    if (!Object.values(formValues).some(Boolean)) return;
    let cancelled = false;
    if (!writeDraft(customerId, formValues, idempotencyKey)) {
      queueMicrotask(() => {
        if (!cancelled) setStorageUnavailable(true);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [availableDraft, customerId, draftReady, formValues, idempotencyKey, state.status]);

  useEffect(() => {
    let cancelled = false;
    async function checkWhenActive() {
      if (document.visibilityState !== "visible" || state.status === "success") return;
      if ((await checkSession()) === false && !cancelled) {
        router.replace(TRANSFER_LOGIN_PATH);
      }
    }

    window.addEventListener("focus", checkWhenActive);
    document.addEventListener("visibilitychange", checkWhenActive);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", checkWhenActive);
      document.removeEventListener("visibilitychange", checkWhenActive);
    };
  }, [router, state.status]);

  const isSuccess = state.status === "success";
  const isDisabled = pending || isSuccess || !draftReady || Boolean(availableDraft);

  function restoreDraft() {
    if (!availableDraft) return;
    if (!canRestoreTransferDraft(availableDraft, customerId, accounts.map((account) => account.id))) {
      discardDraft();
      return;
    }
    setFormValues({
      sourceAccountId: availableDraft.sourceAccountId,
      recipientIdentifier: availableDraft.recipientIdentifier,
      amountInr: availableDraft.amountInr,
      paymentReference: availableDraft.paymentReference,
    });
    setIdempotencyKey(availableDraft.idempotencyKey);
    setAvailableDraft(null);
  }

  function discardDraft() {
    if (availableDraft) {
      clearMatchingDraft(customerId, availableDraft.idempotencyKey);
    }
    setAvailableDraft(null);
  }

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (!writeDraft(customerId, formValues, idempotencyKey)) {
          setStorageUnavailable(true);
        }
      }}
      className="space-y-6"
    >
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <p className="text-sm leading-6 text-slate-600">
        Enter the details for your simulated wire transfer. No real money will
        be sent.
      </p>

      {!draftReady && <p role="status" className="text-sm text-slate-600">Checking for a saved draft…</p>}

      {availableDraft && (
        <section
          aria-labelledby={`${id}-draft-title`}
          className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"
        >
          <h2 id={`${id}-draft-title`} className="font-semibold">
            Unfinished transfer found
          </h2>
          <p className="mt-1">Restore your saved details or discard them to start again.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-full bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-full border border-blue-300 px-4 py-2 font-medium text-blue-800 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Discard Draft
            </button>
          </div>
        </section>
      )}

      {storageUnavailable && (
        <p role="alert" className="text-sm text-amber-800">
          This browser is blocking session storage, so your draft cannot be recovered after sign-in.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Source account */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`${id}-source`}
            className="block text-sm font-medium text-slate-900"
          >
            From account
          </label>

          <select
            id={`${id}-source`}
            name="sourceAccountId"
            value={formValues.sourceAccountId}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                sourceAccountId: event.target.value,
              }))
            }
            required
            disabled={!hasAccounts || isDisabled}
            aria-describedby={`${id}-source-help`}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="" disabled>
              {hasAccounts ? "Choose an account" : "No accounts available"}
            </option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName} ({account.maskedIdentifier})
              </option>
            ))}
          </select>

          <p id={`${id}-source-help`} className="mt-2 text-sm text-slate-500">
            {hasAccounts
              ? "Select the account you would send money from."
              : "You need an account before making a transfer."}
          </p>
        </div>

        {/* Recipient */}
        <div className="sm:col-span-2">
          <label
            htmlFor={`${id}-recipient`}
            className="block text-sm font-medium text-slate-900"
          >
            Recipient identifier
          </label>

          <input
            id={`${id}-recipient`}
            name="recipientIdentifier"
            type="text"
            value={formValues.recipientIdentifier}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                recipientIdentifier: event.target.value,
              }))
            }
            required
            maxLength={100}
            disabled={isDisabled}
            aria-describedby={`${id}-recipient-help`}
            placeholder="Enter recipient identifier"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p
            id={`${id}-recipient-help`}
            className="mt-2 text-sm text-slate-500"
          >
            Enter the identifier supplied by your recipient.
          </p>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor={`${id}-amount`}
            className="block text-sm font-medium text-slate-900"
          >
            Amount (INR)
          </label>

          <input
            id={`${id}-amount`}
            name="amountInr"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={formValues.amountInr}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                amountInr: event.target.value,
              }))
            }
            required
            disabled={isDisabled}
            aria-describedby={`${id}-amount-help`}
            placeholder="0.00"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p id={`${id}-amount-help`} className="mt-2 text-sm text-slate-500">
            Enter a positive amount in rupees.
          </p>
        </div>

        {/* Payment reference */}
        <div>
          <label
            htmlFor={`${id}-reference`}
            className="block text-sm font-medium text-slate-900"
          >
            Payment reference{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>

          <input
            id={`${id}-reference`}
            name="paymentReference"
            type="text"
            value={formValues.paymentReference}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                paymentReference: event.target.value,
              }))
            }
            maxLength={140}
            disabled={isDisabled}
            aria-describedby={`${id}-reference-help`}
            placeholder="For example, rent"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p
            id={`${id}-reference-help`}
            className="mt-2 text-sm text-slate-500"
          >
            A note to help identify this payment.
          </p>
        </div>
      </div>

      {/* Server Action feedback */}
      {state.message && (
        <div
          role={state.status === "error" || state.status === "auth-expired" ? "alert" : "status"}
          className={`rounded-lg p-4 text-sm ${
            state.status === "error" || state.status === "auth-expired"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          <p>{state.message}</p>

          {state.status === "auth-expired" && (
            <Link href={TRANSFER_LOGIN_PATH} className="mt-2 inline-block font-semibold underline">
              Sign in to continue
            </Link>
          )}

          {state.status === "success" && state.transferId && (
            <p className="mt-2 break-all text-xs">
              Transfer ID: {state.transferId}
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="border-t border-slate-200 pt-5">
        <button
          type="submit"
          disabled={!hasAccounts || isDisabled}
          aria-describedby={`${id}-submit-help`}
          className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:w-auto"
        >
          {pending
            ? "Processing..."
            : isSuccess
              ? "Transfer recorded"
              : "Transfer Money"}
        </button>

        <p id={`${id}-submit-help`} className="mt-2 text-sm text-slate-500">
          {isSuccess
            ? "Your simulated transfer has been recorded successfully."
            : "This is a simulated transfer. No real money moves."}
        </p>
      </div>
    </form>
  );
}
