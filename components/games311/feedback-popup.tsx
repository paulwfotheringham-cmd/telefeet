"use client";

import { useState } from "react";

type Props = {
  gameId: string | null;
  busy: boolean;
  onSubmit: (payload: { wouldPay: boolean; feedbackText: string }) => void;
  onDismiss: () => void;
};

export function Games311FeedbackPopup({ gameId, busy, onSubmit, onDismiss }: Props) {
  const [wouldPay, setWouldPay] = useState<boolean | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="games311-feedback-title">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-5 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="games311-feedback-title" className="text-lg font-semibold text-white">
            Enjoying Games311?
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onDismiss}
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          We&apos;re considering making Games311 a subscription gaming platform. We&apos;d love your
          honest opinion.
        </p>
        <p className="mt-4 text-sm font-medium text-white">
          Would you pay $4.99 per month to play these games?
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setWouldPay(true)}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
              wouldPay === true
                ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                : "border-white/15 bg-white/5 text-slate-200"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setWouldPay(false)}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
              wouldPay === false
                ? "border-rose-400/60 bg-rose-500/20 text-rose-100"
                : "border-white/15 bg-white/5 text-slate-200"
            }`}
          >
            No
          </button>
        </div>
        <label className="mt-4 block text-sm text-slate-300">
          Tell us what you think about Games311 or the game you&apos;re currently playing.
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-400/50"
            placeholder="Optional"
          />
        </label>
        {gameId ? (
          <p className="mt-2 text-xs text-slate-500">Current game context: {gameId}</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (wouldPay == null) {
              setError("Please choose Yes or No.");
              return;
            }
            setError(null);
            onSubmit({ wouldPay, feedbackText: text.trim() });
          }}
          className="mt-4 w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
