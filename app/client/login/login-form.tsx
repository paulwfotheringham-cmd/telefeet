"use client";

import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { signInToPortal, type SignInState } from "@/app/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function ClientLoginForm() {
  const [state, formAction] = useFormState(signInToPortal, {});

  return (
    <form
      action={formAction}
      className="w-full max-w-[320px] rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-lg shadow-brand-dark/5"
    >
      <input type="hidden" name="portal" value="client" />

      <div className="mb-4 text-center">
        <Image
          src="/logo-telefeet.png"
          alt="TeleFeet by Footworx"
          width={280}
          height={80}
          priority
          className="mx-auto mb-3 h-auto max-h-[52px] w-auto max-w-[min(100%,240px)] object-contain object-top"
        />
        <h1 className="text-base font-semibold tracking-tight text-brand-dark">
          Care home portal
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-brand-dark/65">
          The details your team shared with you.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-dark">
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className="rounded-lg border border-brand-dark/15 bg-brand-light px-3 py-2 text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/35 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-dark">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-brand-dark/15 bg-brand-light px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25"
          />
        </label>
      </div>

      {state.error ? (
        <p
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
