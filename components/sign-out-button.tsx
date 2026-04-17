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
          "rounded-lg border border-brand-dark/20 bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light"
        }
      >
        Sign out
      </button>
    </form>
  );
}
