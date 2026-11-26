"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ClientRoomState } from "@/lib/funquiz/types";
import {
  faceGenderForSeat,
  holdemFaceUrl,
  readFaceGender,
  writeFaceGender,
  type HoldemFaceGender,
} from "@/lib/funquiz/holdem/faces";

type Props = {
  roomState: ClientRoomState;
  playerId: string;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onRefreshState: (s: ClientRoomState) => void;
  onError: (msg: string) => void;
  onLeaveLobby?: () => void;
};

type SeatView = {
  playerId: string;
  name: string;
  stack: number;
  isAi: boolean;
  folded: boolean;
  cards: string[] | null;
};

function cardColor(label: string): string {
  return label.includes("♥") || label.includes("♦") ? "text-red-500" : "text-slate-900";
}

function PlayingCard({
  label,
  hidden,
  large,
  delayMs = 0,
}: {
  label?: string;
  hidden?: boolean;
  large?: boolean;
  delayMs?: number;
}) {
  const size = large ? "h-20 w-[3.4rem] sm:h-24 sm:w-16" : "h-12 w-9 sm:h-14 sm:w-10";
  if (hidden || !label) {
    return (
      <span
        className={`holdem-card-deal inline-flex ${size} items-center justify-center rounded-md border border-white/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-black shadow-lg`}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <span className="h-[70%] w-[70%] rounded-sm border border-amber-300/30 bg-[repeating-linear-gradient(135deg,#1e293b_0_4px,#0f172a_4px_8px)]" />
      </span>
    );
  }
  const rank = label.slice(0, -1);
  const suit = label.slice(-1);
  return (
    <span
      className={`holdem-card-deal inline-flex ${size} flex-col items-start justify-between rounded-md border border-white/70 bg-gradient-to-b from-white to-slate-100 px-1 py-0.5 shadow-lg`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className={`font-serif text-[11px] font-bold leading-none sm:text-sm ${cardColor(label)}`}>
        {rank}
        {suit}
      </span>
      <span className={`self-end font-serif text-base leading-none sm:text-xl ${cardColor(label)}`}>{suit}</span>
    </span>
  );
}

function ChipStack({ amount }: { amount: number }) {
  const n = Math.min(5, Math.max(1, Math.round(amount / 200)));
  return (
    <div className="relative mx-auto h-6 w-10">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="absolute left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-full border border-amber-100/40 bg-gradient-to-b from-amber-300 to-amber-600 shadow"
          style={{ bottom: i * 3 }}
        />
      ))}
    </div>
  );
}

/** Place seats around an oval: you at bottom, others across the top arc. */
function seatStyle(index: number, total: number, isYou: boolean): CSSProperties {
  if (isYou || total <= 1) {
    return { left: "50%", top: "86%", transform: "translate(-50%, -50%)" };
  }
  const others = total - 1;
  const otherIndex = index; // among non-you seats we remap outside
  const t = others === 1 ? 0.5 : otherIndex / (others - 1);
  const angle = Math.PI * (0.15 + t * 0.7); // top arc
  const x = 50 + Math.cos(angle) * 38;
  const y = 48 - Math.sin(angle) * 32;
  return { left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" };
}

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
  const [pending, setPending] = useState(false);
  const [gender, setGender] = useState<HoldemFaceGender>("male");
  const [flashPot, setFlashPot] = useState(false);

  useEffect(() => {
    setGender(readFaceGender());
  }, []);

  useEffect(() => {
    if (!hv) return;
    setFlashPot(true);
    const id = window.setTimeout(() => setFlashPot(false), 450);
    return () => window.clearTimeout(id);
  }, [hv?.pot, hv?.handNumber, hv?.street]);

  // Keep the table snappy while an AI is thinking — poll the room hard.
  useEffect(() => {
    if (!hv?.actionOn || hv.actionOn === playerId || hv.street === "hand_over") return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(
          `/api/funquiz/room/${encodeURIComponent(roomState.code)}?playerId=${encodeURIComponent(playerId)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as { state?: ClientRoomState };
        if (!cancelled && data.state) onRefreshState(data.state);
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 350);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [hv?.actionOn, hv?.street, playerId, roomState.code, onRefreshState]);

  if (!hv) return null;

  const seats: SeatView[] = hv.seats?.length
    ? hv.seats
    : roomState.players.map((player) => ({
        playerId: player.id,
        name: player.name,
        stack: player.id === playerId ? hv.yourStack : hv.opponentStack,
        isAi: false,
        folded: false,
        cards: player.id === playerId ? hv.yourCards : hv.opponentCards,
      }));

  const youSeat = seats.find((s) => s.playerId === playerId);
  const others = seats.filter((s) => s.playerId !== playerId);
  const orderedForLayout = [...others, ...(youSeat ? [youSeat] : [])];

  const locked = pending || busy;

  const post = async (body: Record<string, unknown>) => {
    setPending(true);
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
      setPending(false);
      setBusy(false);
    }
  };

  const onGender = (next: HoldemFaceGender) => {
    setGender(next);
    writeFaceGender(next);
  };

  const dealerSeatIndex = hv.dealerSeat % Math.max(1, seats.length);
  const dealerId = seats[dealerSeatIndex]?.playerId ?? roomState.players[dealerSeatIndex]?.id;

  return (
    <div className="holdem-stage relative mt-4 overflow-hidden rounded-[1.75rem] border border-amber-500/20 bg-[#120c08] shadow-[0_0_60px_-20px_rgba(212,175,55,0.35)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.12), transparent 55%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30h60M30 0v60' stroke='%23d4af37' stroke-opacity='.05'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300/90">
            Texas Hold&apos;em · Hand #{hv.handNumber}
          </p>
          <p className="mt-1 text-sm text-amber-50/80">
            Blinds {hv.smallBlind}/{hv.bigBlind} ·{" "}
            <span className="uppercase text-amber-200">{hv.street.replace("_", " ")}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-black/40 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => onGender("male")}
              className={`rounded-full px-2.5 py-1 ${gender === "male" ? "bg-amber-400 text-black" : "text-slate-300"}`}
            >
              Male face
            </button>
            <button
              type="button"
              onClick={() => onGender("female")}
              className={`rounded-full px-2.5 py-1 ${gender === "female" ? "bg-amber-400 text-black" : "text-slate-300"}`}
            >
              Female face
            </button>
          </div>
        </div>
      </header>

      {/* Oval table */}
      <div className="relative z-10 mx-auto mt-2 aspect-[5/3.4] w-full max-w-3xl px-2 pb-2 sm:px-4">
        <div className="holdem-table absolute inset-[8%] rounded-[50%] border-[10px] border-[#8a6a2f] bg-[radial-gradient(ellipse_at_center,#1a5c3a_0%,#0d3d28_55%,#082819_100%)] shadow-[inset_0_0_40px_rgba(0,0,0,0.55),0_20px_50px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-[6%] rounded-[50%] border border-amber-200/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/50 ${flashPot ? "holdem-pot-pulse" : ""}`}
            >
              Pot
            </p>
            <p className={`text-3xl font-bold tabular-nums text-amber-200 drop-shadow ${flashPot ? "holdem-pot-pulse" : ""}`}>
              {hv.pot}
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
              {hv.board.length > 0 ? (
                hv.board.map((c, i) => <PlayingCard key={`${c}-${i}`} label={c} delayMs={i * 80} />)
              ) : (
                <p className="text-[11px] uppercase tracking-widest text-emerald-100/40">Waiting for flop</p>
              )}
            </div>
            {roomState.statusMessage ? (
              <p className="holdem-banner mt-2 max-w-[80%] truncate rounded-full bg-black/45 px-3 py-1 text-center text-[11px] text-emerald-50">
                {roomState.statusMessage}
              </p>
            ) : null}
          </div>
        </div>

        {orderedForLayout.map((seat) => {
          const isYou = seat.playerId === playerId;
          const otherIndex = isYou ? 0 : others.findIndex((o) => o.playerId === seat.playerId);
          const style = seatStyle(isYou ? 0 : Math.max(0, otherIndex), seats.length, isYou);
          const g = faceGenderForSeat(seat.playerId, isYou, gender);
          const face = holdemFaceUrl(seat.playerId, g);
          const acting = hv.actionOn === seat.playerId;
          return (
            <div key={seat.playerId} className="absolute z-20 w-[7.5rem] sm:w-36" style={style}>
              <div
                className={`flex flex-col items-center rounded-2xl border px-2 py-2 backdrop-blur-sm transition ${
                  seat.folded
                    ? "border-white/5 bg-black/50 opacity-55"
                    : acting
                      ? "holdem-acting border-amber-300/70 bg-black/70"
                      : "border-white/15 bg-black/55"
                }`}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={face}
                    alt=""
                    className="h-12 w-12 rounded-full border-2 border-amber-200/40 bg-slate-800 object-cover shadow-lg sm:h-14 sm:w-14"
                  />
                  {dealerId === seat.playerId ? (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-black shadow">
                      D
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 max-w-full truncate text-center text-[11px] font-semibold text-white">
                  {isYou ? "You" : seat.name}
                  {seat.isAi ? " · AI" : ""}
                </p>
                <ChipStack amount={seat.stack} />
                <p className="text-[10px] tabular-nums text-amber-100/80">{seat.stack}</p>
                <div className="mt-1 flex gap-1">
                  {seat.folded ? (
                    <span className="text-[10px] uppercase text-slate-400">Folded</span>
                  ) : isYou && seat.cards && seat.cards.length > 0 ? (
                    seat.cards.map((c, i) => <PlayingCard key={c} label={c} large={false} delayMs={i * 60} />)
                  ) : seat.cards && seat.cards.length > 0 ? (
                    seat.cards.map((c, i) => <PlayingCard key={c} label={c} delayMs={i * 60} />)
                  ) : (
                    <>
                      <PlayingCard hidden delayMs={0} />
                      <PlayingCard hidden delayMs={40} />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your big hole cards */}
      {youSeat && !youSeat.folded && youSeat.cards && youSeat.cards.length > 0 ? (
        <div className="relative z-10 -mt-2 mb-3 flex justify-center gap-2">
          {youSeat.cards.map((c, i) => (
            <PlayingCard key={`hero-${c}`} label={c} large delayMs={100 + i * 90} />
          ))}
        </div>
      ) : null}

      {hv.showdownLabel ? (
        <p className="relative z-10 mb-2 text-center text-sm text-amber-100">{hv.showdownLabel}</p>
      ) : null}

      {hv.isYourAction && hv.street !== "hand_over" ? (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 px-4 pb-4">
          {hv.canFold ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => void post({ action: "fold" })}
              className="rounded-full border border-red-400/50 bg-red-950/50 px-5 py-2.5 text-sm font-semibold text-red-100 disabled:opacity-50"
            >
              Fold
            </button>
          ) : null}
          {hv.canCheck ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => void post({ action: "check" })}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Check
            </button>
          ) : null}
          {hv.canCall ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => void post({ action: "call" })}
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow disabled:opacity-50"
            >
              Call {hv.toCall}
            </button>
          ) : null}
          {hv.canRaise ? (
            <>
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "raise", raiseTo: hv.minRaise })}
                className="rounded-full border border-amber-300/60 bg-amber-500/20 px-5 py-2.5 text-sm font-semibold text-amber-50 disabled:opacity-50"
              >
                Raise {hv.minRaise}
              </button>
              <label className="flex items-center gap-1.5 text-xs text-slate-300">
                <input
                  type="number"
                  min={hv.minRaise}
                  className="w-16 rounded-lg border border-white/15 bg-black/50 px-2 py-2 text-white"
                  value={raiseTo ?? hv.minRaise}
                  onChange={(e) => setRaiseTo(Number(e.target.value))}
                />
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "raise", raiseTo: raiseTo ?? hv.minRaise })}
                  className="rounded-full border border-white/20 px-3 py-2 text-slate-100 disabled:opacity-50"
                >
                  Go
                </button>
              </label>
            </>
          ) : null}
          {hv.canAllIn ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => void post({ action: "all_in" })}
              className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-5 py-2.5 text-sm font-bold text-black shadow disabled:opacity-50"
            >
              All in
            </button>
          ) : null}
        </div>
      ) : (
        <p className="relative z-10 pb-3 text-center text-sm text-slate-400">
          {hv.street === "hand_over"
            ? "Hand complete."
            : pending
              ? "Updating…"
              : hv.actionOn
                ? `Waiting for ${seats.find((seat) => seat.playerId === hv.actionOn)?.name ?? "opponent"}…`
                : "Waiting…"}
        </p>
      )}

      {hv.canDealNextHand ? (
        <button
          type="button"
          disabled={locked}
          onClick={() => void post({ action: "deal" })}
          className="relative z-10 mx-4 mb-3 w-[calc(100%-2rem)] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 py-3 text-sm font-bold text-black disabled:opacity-50"
        >
          Deal next hand
        </button>
      ) : null}

      {onLeaveLobby ? (
        <button
          type="button"
          disabled={locked}
          onClick={() => onLeaveLobby()}
          className="relative z-10 mx-4 mb-4 w-[calc(100%-2rem)] rounded-full border border-white/15 py-2 text-sm text-slate-300 disabled:opacity-50"
        >
          Leave table
        </button>
      ) : null}
    </div>
  );
}
