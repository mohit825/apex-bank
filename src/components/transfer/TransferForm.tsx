"use client";

import { useId, type FormEvent } from "react";

export type TransferSourceAccount = {
  id: string;
  displayName: string;
  maskedIdentifier: string;
};

type TransferFormProps = {
  accounts: TransferSourceAccount[];
};

export function TransferForm({ accounts }: TransferFormProps) {
  const id = useId();
  const hasAccounts = accounts.length > 0;

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form onSubmit={preventSubmission} className="space-y-6">
      <p className="text-sm leading-6 text-slate-600">
        Enter the details for your transfer. Sending money is not available yet.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-source`} className="block text-sm font-medium text-slate-900">
            From account
          </label>
          <select
            id={`${id}-source`}
            name="sourceAccountId"
            defaultValue=""
            required
            disabled={!hasAccounts}
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
              : "You need an account before you can prepare a transfer."}
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-recipient`} className="block text-sm font-medium text-slate-900">
            Recipient identifier
          </label>
          <input
            id={`${id}-recipient`}
            name="recipientIdentifier"
            type="text"
            required
            maxLength={100}
            aria-describedby={`${id}-recipient-help`}
            placeholder="Enter recipient identifier"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          />
          <p id={`${id}-recipient-help`} className="mt-2 text-sm text-slate-500">
            Enter the identifier supplied by your recipient.
          </p>
        </div>

        <div>
          <label htmlFor={`${id}-amount`} className="block text-sm font-medium text-slate-900">
            Amount (INR)
          </label>
          <input
            id={`${id}-amount`}
            name="amountInr"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            required
            aria-describedby={`${id}-amount-help`}
            placeholder="0.00"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          />
          <p id={`${id}-amount-help`} className="mt-2 text-sm text-slate-500">
            Enter a positive amount in rupees.
          </p>
        </div>

        <div>
          <label htmlFor={`${id}-reference`} className="block text-sm font-medium text-slate-900">
            Payment reference <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id={`${id}-reference`}
            name="paymentReference"
            type="text"
            maxLength={140}
            aria-describedby={`${id}-reference-help`}
            placeholder="For example, rent"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          />
          <p id={`${id}-reference-help`} className="mt-2 text-sm text-slate-500">
            A note to help identify this payment.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <button
          type="submit"
          disabled
          aria-describedby={`${id}-submit-help`}
          className="w-full rounded-full bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed sm:w-auto"
        >
          Transfer unavailable
        </button>
        <p id={`${id}-submit-help`} className="mt-2 text-sm text-slate-500">
          Transfers will be enabled in a later update.
        </p>
      </div>
    </form>
  );
}
