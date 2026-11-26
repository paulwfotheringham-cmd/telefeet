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
  return label.includes("♥") || label.includes("♦") ? "text-red-600" : "text-slate-900";
}

function PlayingCard({
  label,
  hidden,
  large,
  delayMs = 0,
  tilt = 0,
}: {
  label?: string;
  hidden?: boolean;
  large?: boolean;
  delayMs?: number;
  tilt?: number;
}) {
  const size = large
    ? "h-[5.5rem] w-[3.9rem] sm:h-28 sm:w-20"
    : "h-[3.15rem] w-[2.25rem] sm:h-14 sm:w-10";
  const style: CSSProperties = {
    animationDelay: `${delayMs}ms`,
    transform: `rotate(${tilt}deg)`,
  };

  if (hidden || !label) {
    return (
      <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
        <span className="holdem-card-face holdem-card-back relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.55rem]">
          <span className="absolute inset-[3px] rounded-[0.4rem] border border-amber-200/25 bg-[repeating-linear-gradient(135deg,#1e3a5f_0_3px,#0b1a2e_3px_6px)]" />
          <span className="relative z-[1] h-5 w-5 rounded-full border border-amber-300/40 bg-gradient-to-br from-amber-200/30 to-transparent sm:h-6 sm:w-6" />
        </span>
      </span>
    );
  }

  const rank = label.slice(0, -1);
  const suit = label.slice(-1);
  return (
    <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
      <span className="holdem-card-face relative flex h-full w-full flex-col items-start justify-between overflow-hidden rounded-[0.55rem] bg-gradient-to-br from-white via-[#f7f4ef] to-[#e8e2d8] px-1 py-0.5 sm:px-1.5 sm:py-1">
        <span className={`font-serif text-[11px] font-bold leading-none sm:text-sm ${cardColor(label)}`}>
          {rank}
          {suit}
        </span>
        <span className={`self-center font-serif text-xl leading-none sm:text-3xl ${cardColor(label)}`}>
          {suit}
        </span>
        <span
          className={`self-end rotate-180 font-serif text-[11px] font-bold leading-none sm:text-sm ${cardColor(label)}`}
        >
          {rank}
          {suit}
        </span>
      </span>
    </span>
  );
}

function ChipStack({ amount }: { amount: number }) {
  const n = Math.min(6, Math.max(1, Math.round(amount / 80)));
  return (
    <div className="relative mx-auto h-7 w-11" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="holdem-chip absolute left-1/2 h-2.5 w-9 -translate-x-1/2 rounded-full"
          style={{ bottom: i * 3.5, zIndex: i + 1 }}
        />
      ))}
    </div>
  );
}

/** Place seats around an oval: you at bottom, others across the top arc. */
function seatStyle(index: number, total: number, isYou: boolean): CSSProperties {
  if (isYou || total <= 1) {
    return { left: "50%", top: "90%", transform: "translate(-50%, -50%)" };
  }
  const others = total - 1;
  const otherIndex = index;
  const t = others === 1 ? 0.5 : otherIndex / (others - 1);
  const angle = Math.PI * (0.18 + t * 0.64);
  const x = 50 + Math.cos(angle) * 40;
  const y = 42 - Math.sin(angle) * 30;
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
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    setGender(readFaceGender());
  }, []);

  useEffect(() => {
    if (!hv) return;
    setFlashPot(true);
    const id = window.setTimeout(() => setFlashPot(false), 450);
    return () => window.clearTimeout(id);
  }, [hv?.pot, hv?.handNumber, hv?.street]);

  useEffect(() => {
    if (!hv?.actionDeadlineAt || !hv.actionOn || hv.street === "hand_over") {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.ceil((hv.actionDeadlineAt! - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [hv?.actionDeadlineAt, hv?.actionOn, hv?.street]);

  useEffect(() => {
    if (!hv?.actionOn || hv.street === "hand_over") return;
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
    const ms = hv.actionOn === playerId ? 1000 : 350;
    const id = window.setInterval(() => void tick(), ms);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [hv?.actionOn, hv?.street, playerId, roomState.code, onRefreshState]);

  if (!hv) return null;

  const minRaise = hv.minRaise;
  const maxRaise = hv.maxRaise ?? hv.minRaise + (hv.maxRaiseSize ?? 25);
  const clampedRaise = Math.min(Math.max(raiseTo ?? minRaise, minRaise), maxRaise);

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
  const heroCards = youSeat && !youSeat.folded && youSeat.cards && youSeat.cards.length > 0 ? youSeat.cards : null;

  const locked = pending || busy;

  const post = async (body: Record<string, unknown>) => {
    setPending(true);
    onError("");
    try {
      const res = await fetch(`/api/funquiz/room/${encodeURIComponent(roomState.code)}/holdem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, ...body }),
      });
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
    <div className="holdem-stage relative mt-4 overflow-hidden rounded-[1.75rem] border border-amber-500/25 bg-[#0a0705] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
      <div className="holdem-stage-glow pointer-events-none absolute inset-0" />
      <div className="holdem-stage-grid pointer-events-none absolute inset-0 opacity-30" />

      <header className="relative z-10 flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300/90">
            Texas Hold&apos;em · Hand #{hv.handNumber}
          </p>
          <p className="mt-1 text-sm text-amber-50/80">
            Blinds ${hv.smallBlind}/${hv.bigBlind} · Start ${hv.startingStack ?? 500} · Max raise $
            {hv.maxRaiseSize ?? 25} ·{" "}
            <span className="uppercase text-amber-200">{hv.street.replace("_", " ")}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {secondsLeft != null && hv.actionOn ? (
            <div
              className={`rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums shadow-lg ${
                secondsLeft <= 10
                  ? "border-red-400/60 bg-red-950/80 text-red-100"
                  : "border-amber-300/40 bg-black/60 text-amber-100"
              }`}
              aria-live="polite"
            >
              {secondsLeft}s
            </div>
          ) : null}
          <div className="rounded-full border border-white/10 bg-black/50 p-1 text-[11px] shadow-inner">
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

      <div className="holdem-scene relative z-10 mx-auto mt-1 w-full max-w-3xl px-2 pb-1 sm:px-4">
        <div className="holdem-table-wrap relative mx-auto aspect-[5/3.35] w-full">
          {/* Soft floor shadow under the oval */}
          <div className="holdem-table-floor absolute inset-[10%_6%_4%] rounded-[50%]" />

          {/* Wood rail + felt */}
          <div className="holdem-table-rail absolute inset-[7%] rounded-[50%]">
            <div className="holdem-table-felt absolute inset-[7%] rounded-[50%]">
              <div className="holdem-felt-sheen absolute inset-0 rounded-[50%]" />
              <div className="holdem-felt-rim absolute inset-[5%] rounded-[50%]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-100/45 ${flashPot ? "holdem-pot-pulse" : ""}`}
                >
                  Pot
                </p>
                <p
                  className={`text-3xl font-bold tabular-nums text-amber-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)] sm:text-4xl ${flashPot ? "holdem-pot-pulse" : ""}`}
                >
                  ${hv.pot}
                </p>
                <div className="mt-1 flex min-h-[3.2rem] flex-wrap items-end justify-center gap-1.5 sm:min-h-[3.6rem]">
                  {hv.board.length > 0 ? (
                    hv.board.map((c, i) => (
                      <PlayingCard key={`${c}-${i}`} label={c} delayMs={i * 80} tilt={(i - 2) * 2} />
                    ))
                  ) : (
                    <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/35">Waiting for flop</p>
                  )}
                </div>
                {roomState.statusMessage ? (
                  <p className="holdem-banner mt-1 max-w-[78%] truncate rounded-full border border-white/10 bg-black/55 px-3 py-1 text-center text-[11px] text-emerald-50 shadow-lg backdrop-blur-sm">
                    {roomState.statusMessage}
                  </p>
                ) : null}
              </div>
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
              <div key={seat.playerId} className="absolute z-20 w-[7.75rem] sm:w-36" style={style}>
                <div
                  className={`holdem-seat flex flex-col items-center px-2 py-2 ${
                    seat.folded ? "holdem-seat-folded" : acting ? "holdem-seat-acting holdem-acting" : ""
                  }`}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={face}
                      alt=""
                      className="holdem-avatar h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
                    />
                    {dealerId === seat.playerId ? (
                      <span className="holdem-dealer-btn absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-black">
                        D
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 max-w-full truncate text-center text-[11px] font-semibold text-white drop-shadow">
                    {isYou ? "You" : seat.name}
                    {seat.isAi ? " · AI" : ""}
                  </p>
                  <ChipStack amount={seat.stack} />
                  <p className="text-[10px] font-semibold tabular-nums text-amber-100/90">${seat.stack}</p>

                  {/* Opponents only: hole cards here. Your two cards render once below as the hero hand. */}
                  {!isYou ? (
                    <div className="mt-1 flex gap-1">
                      {seat.folded ? (
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">Folded</span>
                      ) : seat.cards && seat.cards.length > 0 ? (
                        seat.cards.slice(0, 2).map((c, i) => (
                          <PlayingCard key={`${seat.playerId}-${c}-${i}`} label={c} delayMs={i * 60} tilt={i === 0 ? -6 : 6} />
                        ))
                      ) : (
                        <>
                          <PlayingCard hidden delayMs={0} tilt={-8} />
                          <PlayingCard hidden delayMs={40} tilt={8} />
                        </>
                      )}
                    </div>
                  ) : seat.folded ? (
                    <span className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">Folded</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exactly two hero hole cards */}
      {heroCards ? (
        <div className="holdem-hero relative z-10 -mt-3 mb-2 flex justify-center gap-2 sm:-mt-4 sm:mb-3 sm:gap-3">
          {heroCards.slice(0, 2).map((c, i) => (
            <PlayingCard
              key={`hero-${c}-${i}`}
              label={c}
              large
              delayMs={100 + i * 90}
              tilt={i === 0 ? -8 : 8}
            />
          ))}
        </div>
      ) : null}

      {hv.showdownLabel ? (
        <p className="relative z-10 mb-2 text-center text-sm text-amber-100">{hv.showdownLabel}</p>
      ) : null}

      {hv.isYourAction && hv.street !== "hand_over" ? (
        <div className="relative z-10 space-y-2 px-4 pb-4">
          {secondsLeft != null ? (
            <p
              className={`text-center text-xs font-semibold uppercase tracking-widest ${
                secondsLeft <= 10 ? "text-red-300" : "text-amber-200/80"
              }`}
            >
              Your shot · {secondsLeft}s left
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {hv.canFold ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "fold" })}
                className="holdem-btn rounded-full border border-red-400/50 bg-gradient-to-b from-red-800/80 to-red-950/90 px-5 py-2.5 text-sm font-semibold text-red-50 disabled:opacity-50"
              >
                Fold
              </button>
            ) : null}
            {hv.canCheck ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "check" })}
                className="holdem-btn rounded-full border border-white/20 bg-gradient-to-b from-white/15 to-white/5 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Check
              </button>
            ) : null}
            {hv.canCall ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "call" })}
                className="holdem-btn rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-black shadow-lg disabled:opacity-50"
              >
                Call ${hv.toCall}
              </button>
            ) : null}
            {hv.canRaise ? (
              <>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "raise", raiseTo: minRaise })}
                  className="holdem-btn rounded-full border border-amber-300/50 bg-gradient-to-b from-amber-500/40 to-amber-800/40 px-5 py-2.5 text-sm font-semibold text-amber-50 disabled:opacity-50"
                >
                  Raise ${minRaise}
                </button>
                <label className="flex items-center gap-1.5 text-xs text-slate-300">
                  <input
                    type="number"
                    min={minRaise}
                    max={maxRaise}
                    className="w-16 rounded-lg border border-white/15 bg-black/60 px-2 py-2 text-white shadow-inner"
                    value={clampedRaise}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isFinite(n)) return;
                      setRaiseTo(Math.min(Math.max(n, minRaise), maxRaise));
                    }}
                  />
                  <span className="text-[10px] text-slate-500">max ${maxRaise}</span>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void post({ action: "raise", raiseTo: clampedRaise })}
                    className="holdem-btn rounded-full border border-white/20 px-3 py-2 text-slate-100 disabled:opacity-50"
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
                className="holdem-btn rounded-full bg-gradient-to-b from-amber-200 to-yellow-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg disabled:opacity-50"
              >
                All in
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="relative z-10 pb-3 text-center text-sm text-slate-400">
          {hv.street === "hand_over"
            ? "Hand complete."
            : pending
              ? "Updating…"
              : hv.actionOn
                ? `Waiting for ${seats.find((seat) => seat.playerId === hv.actionOn)?.name ?? "opponent"}${
                    secondsLeft != null ? ` · ${secondsLeft}s` : ""
                  }…`
                : "Waiting…"}
        </p>
      )}

      {hv.canDealNextHand ? (
        <button
          type="button"
          disabled={locked}
          onClick={() => void post({ action: "deal" })}
          className="holdem-btn relative z-10 mx-4 mb-3 w-[calc(100%-2rem)] rounded-full bg-gradient-to-b from-emerald-300 to-teal-500 py-3 text-sm font-bold text-black shadow-lg disabled:opacity-50"
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
