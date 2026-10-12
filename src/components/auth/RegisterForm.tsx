"use client";

import { useActionState } from "react";

import { registerUser, type RegisterState } from "@/app/register/actions";

const initialState: RegisterState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5 text-left">
      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-slate-700"
        >
          Email address
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={
            state.errors?.email ? "register-email-error" : undefined
          }
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm aria-invalid:border-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        />
        {state.errors?.email && (
          <p
            id="register-email-error"
            role="alert"
            className="mt-2 text-sm text-red-700"
          >
            {state.errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={5}
          required
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={
            state.errors?.password
              ? "register-password-hint register-password-error"
              : "register-password-hint"
          }
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm aria-invalid:border-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        />
        <p id="register-password-hint" className="mt-2 text-sm text-slate-600">
          Use at least 5 characters.
        </p>
        {state.errors?.password && (
          <p
            id="register-password-error"
            role="alert"
            className="mt-2 text-sm text-red-700"
          >
            {state.errors.password}
          </p>
        )}
      </div>

      {state.message && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
