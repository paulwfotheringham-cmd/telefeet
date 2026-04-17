"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInToPortal, type SignInState } from "@/app/auth/actions";
import {
  portalLoginCard,
  portalLoginInput,
  portalLoginLabel,
  portalLoginSubmit,
} from "@/components/portal-login-styles";
import { TelefeetLoginLogo } from "@/components/telefeet-login-logo";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={portalLoginSubmit}
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function ClientLoginForm() {
  const [state, formAction] = useFormState(signInToPortal, {});

  return (
    <form action={formAction} className={portalLoginCard}>
      <input type="hidden" name="portal" value="client" />

      <div className="mb-5 text-center">
        <TelefeetLoginLogo />
        <h1 className="text-base font-semibold tracking-tight text-brand-dark">
          Care home portal
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <label className={portalLoginLabel}>
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            className={portalLoginInput}
          />
        </label>
        <label className={portalLoginLabel}>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={portalLoginInput}
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
