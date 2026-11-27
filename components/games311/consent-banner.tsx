"use client";

type Props = {
  onAccept: () => void;
  onDecline: () => void;
};

export function Games311ConsentBanner({ onAccept, onDecline }: Props) {
  return (
    <div
      role="dialog"
      aria-label="Privacy and analytics"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/15 bg-slate-950/95 p-4 text-slate-100 shadow-2xl backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-sm leading-relaxed text-slate-300">
          <p className="font-semibold text-white">Privacy on Games311</p>
          <p className="mt-1">
            We use an anonymous browser ID (no names or emails) to understand which games people
            play and to ask one optional feedback question after a few minutes of active use. You
            can decline analytics; the games still work either way.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-400"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
