"use client";

import { signOut } from "@/app/auth/actions";
import type { Portal } from "@/lib/portal";

type Props = {
  /** Which portal login page to open after signing out */
  redirectPortal: Portal;
  className?: string;
};

export function SignOutButton({ redirectPortal, className }: Props) {
  return (
    <form action={signOut}>
      <input type="hidden" name="portal" value={redirectPortal} />
      <button
        type="submit"
        className={
          className ??
          "rounded-xl border border-brand-line bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-brand-cream transition hover:border-brand-gold/50 hover:bg-brand-panel"
        }
      >
        Sign out
      </button>
    </form>
  );
}
