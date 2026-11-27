"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-100 px-4">
      <form
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          void fetch("/api/games311/results/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as { error?: string };
                throw new Error(body.error || "Login failed");
              }
              const next = params.get("next") || "/results";
              router.replace(next.startsWith("/results") ? next : "/results");
              router.refresh();
            })
            .catch((err) => setError(err instanceof Error ? err.message : "Login failed"))
            .finally(() => setBusy(false));
        }}
      >
        <h1 className="text-lg font-semibold text-slate-900">Games311 Results</h1>
        <p className="mt-1 text-sm text-slate-500">Private analytics — password required.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}

export default function ResultsLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-slate-100" />}>
      <LoginForm />
    </Suspense>
  );
}
