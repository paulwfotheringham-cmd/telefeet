"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInToPortal, type SignInState } from "@/app/auth/actions";
import {
  portalLoginCard,
  portalLoginInput,
  portalLoginLabel,
  portalLoginSubmit,
} from "@/components/portal-login-styles";
import { TelefeetMark } from "@/components/telefeet-mark";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={portalLoginSubmit}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function AffiliateLoginForm() {
  const [state, formAction] = useFormState(signInToPortal, {});

  return (
    <form action={formAction} className={portalLoginCard}>
      <input type="hidden" name="portal" value="affiliate" />

      <div className="mb-5 text-center">
        <TelefeetMark className="mx-auto mb-3 h-12 w-auto" />
        <h2 className="text-base font-semibold tracking-tight text-brand-cream">
          Affiliate podiatrist portal
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-brand-muted">
          Clinical tools and referrals from Footworx.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className={portalLoginLabel}>
          Professional email
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
          className="mt-3 rounded-lg border border-red-900/60 bg-red-950/50 px-3 py-2 text-xs text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
