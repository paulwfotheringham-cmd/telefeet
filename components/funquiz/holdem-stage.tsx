"use client";

import { useState } from "react";
import type { ClientRoomState } from "@/lib/funquiz/types";

type Props = {
  roomState: ClientRoomState;
  playerId: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onRefreshState: (s: ClientRoomState) => void;
  onError: (msg: string) => void;
  onLeaveLobby?: () => void;
};

export function HoldemStage({
  roomState,
  playerId,
  busy,
  setBusy,
  onRefreshState,
  onError,
  onLeaveLobby,
}: Props) {
  const hv = roomState.holdemView;
  const [raiseTo, setRaiseTo] = useState<number | null>(null);

  if (!hv) return null;

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    onError("");
    try {
      const res = await fetch(
        `/api/funquiz/room/${encodeURIComponent(roomState.code)}/holdem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, ...body }),
        },
      );
      const data = (await res.json()) as { state?: ClientRoomState; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.state) onRefreshState(data.state);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const opponent = roomState.players.find((p) => p.id !== playerId);

  return (
    <div className="mt-6 rounded-3xl border border-emerald-500/25 bg-[#041510] p-4 shadow-xl md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            Texas Hold&apos;em · Hand #{hv.handNumber}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Dealer: <strong className="text-emerald-200">{hv.dealerName}</strong> · Blinds{" "}
            {hv.smallBlind}/{hv.bigBlind}
          </p>
          <p className="mt-1 text-xs uppercase text-slate-500">{hv.street.replace("_", " ")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Pot</p>
          <p className="text-2xl font-bold tabular-nums text-amber-200">{hv.pot}</p>
        </div>
      </header>

      {roomState.statusMessage ? (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100">
          {roomState.statusMessage}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hv.board.length > 0 ? (
          hv.board.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="flex h-14 w-11 items-center justify-center rounded-lg border border-white/20 bg-black/60 font-mono text-sm text-white"
            >
              {c}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">Board — preflop</p>
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/30 bg-black/40 p-4">
          <p className="text-xs text-emerald-300">You · {hv.yourStack} chips</p>
          <div className="mt-3 flex gap-2">
            {hv.yourCards.map((c) => (
              <span
                key={c}
                className="flex h-16 w-12 items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-950/50 font-mono text-lg text-white"
              >
                {c}
              </span>
            ))}
          </div>
          {hv.showdownLabel ? (
            <p className="mt-2 text-xs text-slate-400">{hv.showdownLabel}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-slate-400">
            {opponent?.name ?? "Opponent"} · {hv.opponentStack} chips
          </p>
          {hv.opponentCards ? (
            <div className="mt-3 flex gap-2">
              {hv.opponentCards.map((c) => (
                <span
                  key={c}
                  className="flex h-16 w-12 items-center justify-center rounded-lg border border-white/20 bg-slate-900 font-mono text-lg text-slate-200"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Hidden hole cards</p>
          )}
        </div>
      </div>

      {hv.isYourAction && hv.street !== "hand_over" ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {hv.canFold ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void post({ action: "fold" })}
              className="rounded-xl border border-red-400/40 px-4 py-2 text-sm text-red-200"
            >
              Fold
            </button>
          ) : null}
          {hv.canCheck ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void post({ action: "check" })}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-200"
            >
              Check
            </button>
          ) : null}
          {hv.canCall ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void post({ action: "call" })}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Call {hv.toCall}
            </button>
          ) : null}
          {hv.canRaise ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => void post({ action: "raise", raiseTo: hv.minRaise })}
                className="rounded-xl border border-amber-400/50 px-4 py-2 text-sm text-amber-100"
              >
                Raise to {hv.minRaise}
              </button>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                Custom
                <input
                  type="number"
                  min={hv.minRaise}
                  className="w-20 rounded border border-white/15 bg-black/50 px-2 py-1 text-white"
                  value={raiseTo ?? hv.minRaise}
                  onChange={(e) => setRaiseTo(Number(e.target.value))}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void post({ action: "raise", raiseTo: raiseTo ?? hv.minRaise })
                  }
                  className="rounded-lg border border-white/15 px-2 py-1 text-slate-200"
                >
                  Raise
                </button>
              </label>
            </>
          ) : null}
          {hv.canAllIn ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void post({ action: "all_in" })}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-black"
            >
              All in
            </button>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-slate-400">
          {hv.street === "hand_over"
            ? "Hand complete."
            : "Waiting for opponent…"}
        </p>
      )}

      {hv.canDealNextHand ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void post({ action: "deal" })}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-semibold text-black"
        >
          Deal next hand (dealer rotates)
        </button>
      ) : null}

      {onLeaveLobby ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => onLeaveLobby()}
          className="mt-4 w-full rounded-xl border border-white/15 py-2 text-sm text-slate-300"
        >
          Leave table
        </button>
      ) : null}
    </div>
  );
}
