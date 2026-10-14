"use client";

import {
  submitTransfer,
  TransferActionState,
} from "@/app/dashboard/transfer/action";
import { useActionState, useId, useState } from "react";

export type TransferSourceAccount = {
  id: string;
  displayName: string;
  maskedIdentifier: string;
};

type TransferFormProps = {
  accounts: TransferSourceAccount[];
  initialIdempotencyKey: string;
};

const initialState: TransferActionState = {
  status: "idle",
  message: "",
};

export function TransferForm({
  accounts,
  initialIdempotencyKey,
}: TransferFormProps) {
  const id = useId();

  const hasAccounts = accounts.length > 0;

  // Keep the same key for retries of this intended transfer.
  const [idempotencyKey] = useState(initialIdempotencyKey);

  // React manages the Server Action result and pending status.
  const [state, formAction, pending] = useActionState(
    submitTransfer,
    initialState,
  );

  // Keep user-entered values after server validation errors.
  const [formValues, setFormValues] = useState({
    sourceAccountId: "",
    recipientIdentifier: "",
    amountInr: "",
    paymentReference: "",
  });

  const isSuccess = state.status === "success";
  const isDisabled = pending || isSuccess;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <p className="text-sm leading-6 text-slate-600">
        Enter the details for your simulated wire transfer. No real money will
        be sent.
      </p>

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
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg p-4 text-sm ${
            state.status === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          <p>{state.message}</p>

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
          disabled={!hasAccounts || pending || isSuccess}
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
