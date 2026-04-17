"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInToPortal, type SignInState } from "@/app/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-brand-dark shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function AffiliateLoginForm() {
  const [state, formAction] = useFormState(signInToPortal, {});

  return (
    <form
      action={formAction}
      className="w-full max-w-md rounded-xl border border-brand-dark/10 bg-white p-8 shadow-lg"
    >
      <input type="hidden" name="portal" value="affiliate" />
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">
            Affiliate podiatrist portal
          </h2>
          <p className="text-sm text-brand-dark/70">
            Clinical tools and referrals from Footworx.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-brand-dark">
          Professional email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-md border border-brand-dark/15 bg-brand-light px-3 py-2 text-sm text-brand-dark outline-none ring-brand-primary focus:border-brand-primary focus:ring-1"
          />
        </label>
        <label className="block text-sm font-medium text-brand-dark">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border border-brand-dark/15 bg-brand-light px-3 py-2 text-sm text-brand-dark outline-none ring-brand-primary focus:border-brand-primary focus:ring-1"
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
