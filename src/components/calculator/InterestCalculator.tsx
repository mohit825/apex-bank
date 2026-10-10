"use client";
import { useState } from "react";

export default function InterestCalculator() {
  const [principalAmount, setPrincipalAmount] = useState<string>("10000");
  const [rate, setRate] = useState<string>("5");
  const [time, setTime] = useState<string>("2");

  const principal = Number(principalAmount);
  const annualRate = Number(rate);
  const years = Number(time);

  const principalError =
    principalAmount.trim() === "" || !Number.isFinite(principal) || principal <= 0
      ? "Enter a valid principal amount greater than 0."
      : null;
  const rateError =
    rate.trim() === "" || !Number.isFinite(annualRate) || annualRate < 0
      ? "Enter a valid annual interest rate of 0% or more."
      : null;
  const timeError =
    time.trim() === "" || !Number.isFinite(years) || years <= 0
      ? "Enter a valid time period greater than 0 years."
      : null;

  const hasValidInputs = !principalError && !rateError && !timeError;
  const calculatedInterest = hasValidInputs
    ? (principal * annualRate * years) / 100
    : null;
  const maturityAmount =
    calculatedInterest === null ? null : principal + calculatedInterest;
  const hasValidResults =
    calculatedInterest !== null &&
    maturityAmount !== null &&
    Number.isFinite(calculatedInterest) &&
    Number.isFinite(maturityAmount);
  const calculationError =
    hasValidInputs && !hasValidResults
      ? "These values are too large to calculate."
      : null;

  return (
    <div className="mt-8 text-left">
      <fieldset>
        <legend className="sr-only">Interest calculator inputs</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="principal-amount"
              className="block text-sm font-medium text-slate-700"
            >
              Principal Amount
            </label>
            <input
              id="principal-amount"
              name="principalAmount"
              type="number"
              step="any"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              aria-invalid={Boolean(principalError)}
              aria-describedby={
                principalError ? "principal-amount-error" : undefined
              }
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm aria-invalid:border-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            />
            {principalError && (
              <p
                id="principal-amount-error"
                role="status"
                className="mt-2 text-sm text-red-700"
              >
                {principalError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="annual-interest-rate"
              className="block text-sm font-medium text-slate-700"
            >
              Annual Interest Rate (%)
            </label>
            <input
              id="annual-interest-rate"
              name="annualInterestRate"
              type="number"
              step="any"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              aria-invalid={Boolean(rateError)}
              aria-describedby={
                rateError ? "annual-interest-rate-error" : undefined
              }
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm aria-invalid:border-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            />
            {rateError && (
              <p
                id="annual-interest-rate-error"
                role="status"
                className="mt-2 text-sm text-red-700"
              >
                {rateError}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="time-period-years"
              className="block text-sm font-medium text-slate-700"
            >
              Time Period (Years)
            </label>
            <input
              id="time-period-years"
              name="timePeriodYears"
              type="number"
              step="any"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-invalid={Boolean(timeError)}
              aria-describedby={
                timeError ? "time-period-years-error" : undefined
              }
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm aria-invalid:border-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            />
            {timeError && (
              <p
                id="time-period-years-error"
                role="status"
                className="mt-2 text-sm text-red-700"
              >
                {timeError}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <section
        aria-labelledby="results-heading"
        className="mt-8 border-t border-slate-200 pt-6"
      >
        <h2
          id="results-heading"
          className="text-base font-semibold text-slate-900"
        >
          Results
        </h2>
        {calculationError && (
          <p role="status" className="mt-2 text-sm text-red-700">
            {calculationError}
          </p>
        )}
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <dt className="text-sm font-medium text-slate-600">
              Total Interest
            </dt>
            <dd className="mt-2 text-xl font-semibold text-slate-900">
              <output htmlFor="principal-amount annual-interest-rate time-period-years">
                <span aria-hidden="true">
                  {hasValidResults ? calculatedInterest : "—"}
                </span>
                <span className="sr-only">
                  {hasValidResults ? calculatedInterest : "No result available"}
                </span>
              </output>
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <dt className="text-sm font-medium text-slate-600">
              Maturity Amount
            </dt>
            <dd className="mt-2 text-xl font-semibold text-slate-900">
              <output htmlFor="principal-amount annual-interest-rate time-period-years">
                <span aria-hidden="true">
                  {hasValidResults ? maturityAmount : "—"}
                </span>
                <span className="sr-only">
                  {hasValidResults ? maturityAmount : "No result available"}
                </span>
              </output>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
