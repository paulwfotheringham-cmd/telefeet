"use client";

import { useState } from "react";
import { saveClubSession, type ClubSession } from "@/lib/funquiz/club-browser";

export function LoginScreen({ onSuccess }: { onSuccess: (account: ClubSession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(mode: "login" | "signup") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/club/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mode }),
      });
      const data = (await res.json()) as { error?: string; token?: string; account?: { id: string; email: string; name: string } };
      if (!res.ok || !data.token || !data.account) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      const session = { ...data.account, token: data.token };
      saveClubSession(session);
      onSuccess(session);
    } catch {
      setError("Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-8 shadow-2xl shadow-violet-900/40">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Two-player quiz</p>
        <h1 className="mt-3 text-center text-4xl font-bold tracking-tight text-white">Fun Quiz</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
          Enter your email and password. No verification email.
        </p>
        <label className="mt-6 block text-sm font-medium text-slate-200">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder="you@email.com"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-200">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder="At least 6 characters"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit("login")}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Log in
        </button>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-slate-500">or</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit("signup")}
          className="mt-4 w-full rounded-xl border border-white/15 py-3.5 text-sm font-semibold text-slate-100 disabled:opacity-60"
        >
          Create account
        </button>
        {error ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
