"use client";

type Props = {
  busy: boolean;
  error: string | null;
  onAnswer: (wouldPay: boolean) => void;
};

export function Games311FeedbackPopup({ busy, error, onAnswer }: Props) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="games311-feedback-title"
      // Block outside-click dismissal
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-6 text-slate-100 shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") e.preventDefault();
        }}
      >
        <h2 id="games311-feedback-title" className="text-lg font-semibold text-white">
          Enjoying Games311?
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          We&apos;re considering making Games311 a subscription gaming platform. We&apos;d love your
          honest opinion.
        </p>
        <p className="mt-5 text-base font-medium text-white">
          Would you pay $4.99 a month to play these games?
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onAnswer(true)}
            className="flex-1 rounded-xl border border-emerald-400/50 bg-emerald-500/20 py-3 text-sm font-semibold text-emerald-50 hover:bg-emerald-500/30 disabled:opacity-60"
          >
            {busy ? "Saving…" : "YES"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onAnswer(false)}
            className="flex-1 rounded-xl border border-rose-400/50 bg-rose-500/20 py-3 text-sm font-semibold text-rose-50 hover:bg-rose-500/30 disabled:opacity-60"
          >
            {busy ? "Saving…" : "NO"}
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <p className="mt-4 text-xs text-slate-500">Please choose YES or NO to continue.</p>
      </div>
    </div>
  );
}
