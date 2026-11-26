"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ClientRoomState, HoldemSeatView } from "@/lib/funquiz/types";
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

function cardColor(label: string): string {
  return label.includes("♥") || label.includes("♦") ? "text-[#b91c1c]" : "text-[#1c1410]";
}

function PlayingCard({
  label,
  hidden,
  large,
  hero,
  delayMs = 0,
  tilt = 0,
}: {
  label?: string;
  hidden?: boolean;
  large?: boolean;
  hero?: boolean;
  delayMs?: number;
  tilt?: number;
}) {
  const size = hero
    ? "h-[6.4rem] w-[4.5rem] sm:h-[8.2rem] sm:w-[5.7rem]"
    : large
      ? "h-[4.6rem] w-[3.25rem] sm:h-[5.5rem] sm:w-[3.9rem]"
      : "h-[2.7rem] w-[1.95rem] sm:h-11 sm:w-8";
  const style: CSSProperties = {
    animationDelay: `${delayMs}ms`,
    transform: `rotate(${tilt}deg)`,
  };

  if (hidden || !label) {
    return (
      <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
        <span className="holdem-card-face holdem-card-back relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.4rem]">
          <span className="absolute inset-[3px] rounded-[0.28rem] border border-[#c4a574]/40 bg-[radial-gradient(circle_at_center,#5a2f18_0%,#2a160c_70%)]" />
          <span className="relative z-[1] text-[10px] text-[#d7b57a]/55">♦</span>
        </span>
      </span>
    );
  }

  const rank = label.slice(0, -1);
  const suit = label.slice(-1);
  return (
    <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
      <span className="holdem-card-face relative flex h-full w-full flex-col items-start justify-between overflow-hidden rounded-[0.4rem] bg-gradient-to-br from-[#fffaf2] via-[#f2e6d0] to-[#dfd0b4] px-1 py-0.5 sm:px-1.5 sm:py-1">
        <span className={`font-serif text-[11px] font-bold leading-none sm:text-sm ${cardColor(label)}`}>
          {rank}
          {suit}
        </span>
        <span className={`self-center font-serif text-2xl leading-none sm:text-4xl ${cardColor(label)}`}>
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

function seatStatus(seat: HoldemSeatView, street: string, isYou: boolean): string {
  if (seat.isWinner && street === "hand_over") return seat.playerId ? "Winner" : "Winner";
  if (seat.folded) return "Folded";
  if (seat.isActing) return isYou ? "Your turn…" : "Thinking…";
  if (seat.allIn) return "All in";
  if (seat.streetBet > 0) return `Bet $${seat.streetBet}`;
  if (seat.isBigBlind) return "Big blind";
  if (seat.isSmallBlind) return "Small blind";
  if (seat.isDealer) return "Dealer";
  return "";
}

function opponentSeatStyle(index: number, total: number): CSSProperties {
  const t = total <= 1 ? 0.5 : index / Math.max(1, total - 1);
  const x = 28 + t * 44;
  const y = 18 + Math.sin(Math.PI * t) * 4;
  return { left: `${x}%`, top: `${y}%`, transform: "translate(-50%, 0)" };
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
    const id = window.setTimeout(() => setFlashPot(false), 550);
    return () => window.clearTimeout(id);
  }, [hv?.pot, hv?.handNumber, hv?.street, hv?.lastWinnerId]);

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

  const seats: HoldemSeatView[] = hv.seats?.length
    ? hv.seats
    : roomState.players.map((player) => ({
        playerId: player.id,
        name: player.name,
        stack: player.id === playerId ? hv.yourStack : hv.opponentStack,
        isAi: false,
        folded: false,
        allIn: false,
        streetBet: 0,
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false,
        isActing: hv.actionOn === player.id,
        isWinner: false,
        cards: player.id === playerId ? hv.yourCards : hv.opponentCards,
      }));

  const youSeat = seats.find((s) => s.playerId === playerId);
  const others = seats.filter((s) => s.playerId !== playerId);
  const heroCards =
    youSeat && !youSeat.folded && ((youSeat.cards && youSeat.cards.length > 0) || hv.yourCards?.length)
      ? (youSeat.cards?.length ? youSeat.cards : hv.yourCards).slice(0, 2)
      : [];
  const boardSlots = Array.from({ length: 5 }, (_, i) => hv.board[i] ?? null);
  const locked = pending || busy;
  const handOver = hv.street === "hand_over";
  const winnerName = hv.lastWinnerName;
  const youWon = hv.lastWinnerId === playerId && handOver;

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

  return (
    <div className="holdem-fp relative mt-1 min-h-[min(92dvh,920px)] overflow-hidden rounded-xl border border-[#5a3d22]/60 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)]">
      {/* Cinematic saloon plate */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/funquiz/holdem/saloon-plate.jpg"
        alt=""
        className="holdem-fp-plate pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="holdem-fp-grade pointer-events-none absolute inset-0" />
      <div className="holdem-fp-vignette pointer-events-none absolute inset-0" />

      {/* Tiny top meta */}
      <div className="relative z-30 flex items-start justify-between gap-2 px-3 pt-3 sm:px-5">
        <div>
          <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#f0d9a8]/85 drop-shadow">
            Saloon Hold&apos;em · Hand #{hv.handNumber}
          </p>
          <p className="mt-0.5 text-[11px] text-[#d8c4a0]/70 drop-shadow">
            Blinds ${hv.smallBlind}/${hv.bigBlind} · Max raise ${hv.maxRaiseSize ?? 25} · {roomState.code}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {secondsLeft != null && hv.actionOn ? (
            <span
              className={`rounded px-2 py-1 font-serif text-sm tabular-nums backdrop-blur-sm ${
                secondsLeft <= 10 ? "bg-red-950/70 text-red-100" : "bg-black/45 text-[#f0d9a8]"
              }`}
            >
              {secondsLeft}s
            </span>
          ) : null}
          <div className="rounded bg-black/40 p-0.5 text-[10px] backdrop-blur-sm">
            <button
              type="button"
              onClick={() => {
                setGender("male");
                writeFaceGender("male");
              }}
              className={`rounded px-2 py-1 ${gender === "male" ? "bg-[#c4a574] text-[#1a1208]" : "text-[#d8c4a0]"}`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => {
                setGender("female");
                writeFaceGender("female");
              }}
              className={`rounded px-2 py-1 ${gender === "female" ? "bg-[#c4a574] text-[#1a1208]" : "text-[#d8c4a0]"}`}
            >
              Female
            </button>
          </div>
          {onLeaveLobby ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => onLeaveLobby()}
              className="rounded bg-black/45 px-2.5 py-1.5 text-[11px] text-[#d8c4a0] backdrop-blur-sm disabled:opacity-50"
            >
              Leave
            </button>
          ) : null}
        </div>
      </div>

      {/* LHS roster — RDR2 */}
      <aside className="holdem-fp-roster absolute bottom-28 left-2 z-30 w-[11.5rem] sm:bottom-32 sm:left-4 sm:w-[13.5rem]">
        <ul className="space-y-2">
          {seats.map((seat) => {
            const isYou = seat.playerId === playerId;
            const g = faceGenderForSeat(seat.playerId, isYou, gender);
            const face = holdemFaceUrl(seat.playerId, g);
            const status = seatStatus(seat, hv.street, isYou);
            return (
              <li
                key={seat.playerId}
                className={`holdem-fp-row flex items-center gap-2 ${
                  seat.isWinner ? "holdem-fp-row-winner" : seat.isActing ? "holdem-fp-row-acting" : ""
                } ${seat.folded ? "opacity-50" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={face} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[#c4a574]/40 sm:h-10 sm:w-10" />
                <div className="min-w-0">
                  <p className="font-serif text-lg leading-none text-white drop-shadow tabular-nums sm:text-xl">
                    ${seat.stack}
                  </p>
                  <p className="truncate text-[11px] text-white/80 drop-shadow">
                    {isYou ? "You" : seat.name}
                    {seat.isDealer ? " · D" : ""}
                  </p>
                  <p
                    className={`truncate text-[10px] drop-shadow ${
                      seat.isWinner ? "text-[#ffe6a0]" : seat.isActing ? "text-[#f5e6c0]" : "text-white/55"
                    }`}
                  >
                    {seat.isWinner && hv.lastPotWon ? `Won $${hv.lastPotWon}` : status}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Top-right community HUD */}
      <div className="absolute right-2 top-14 z-30 sm:right-4 sm:top-16">
        <div className="flex gap-1 drop-shadow-lg">
          {boardSlots.map((c, i) =>
            c ? (
              <PlayingCard key={`hud-${c}-${i}`} label={c} delayMs={i * 40} />
            ) : (
              <span
                key={`empty-${i}`}
                className="inline-flex h-[2.7rem] w-[1.95rem] rounded-[0.35rem] border border-[#c4a574]/35 bg-black/35 sm:h-11 sm:w-8"
              />
            ),
          )}
        </div>
        <p className="mt-1 text-right font-serif text-sm text-white drop-shadow">
          Pot ${hv.pot}
          <span className="ml-2 text-[10px] uppercase tracking-widest text-white/55">
            {hv.street.replace("_", " ")}
          </span>
        </p>
      </div>

      {/* Live table layer over plate */}
      <div className="holdem-fp-table absolute inset-x-0 top-[12%] z-20 mx-auto h-[52%] w-[92%] max-w-4xl sm:top-[10%] sm:h-[58%]">
        <div className="holdem-fp-rail absolute inset-[4%_6%_8%] rounded-[50%]">
          <div className="holdem-fp-felt absolute inset-[7%] rounded-[50%]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`holdem-fp-pot ${flashPot ? "holdem-pot-pulse" : ""}`}>
                <div className="holdem-fp-chip-pile" aria-hidden>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`holdem-chip holdem-chip-${i % 3}`} style={{ left: `${20 + i * 9}%`, bottom: i % 2 }} />
                  ))}
                </div>
                <p className="font-serif text-3xl font-semibold text-[#ffe6a0] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-4xl">
                  ${hv.pot}
                </p>
              </div>
              <div className="mt-2 flex min-h-[3.2rem] items-end justify-center gap-1.5">
                {hv.board.length > 0 ? (
                  hv.board.map((c, i) => (
                    <PlayingCard key={`${c}-${i}`} label={c} large delayMs={i * 70} tilt={(i - 2) * 1.2} />
                  ))
                ) : (
                  <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#cfe3d4]/40">
                    Waiting for flop
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {others.map((seat, index) => {
          const g = faceGenderForSeat(seat.playerId, false, gender);
          const face = holdemFaceUrl(seat.playerId, g);
          return (
            <div
              key={seat.playerId}
              className="absolute z-30 flex w-[7rem] flex-col items-center sm:w-32"
              style={opponentSeatStyle(index, others.length)}
            >
              <div className={`holdem-fp-opp ${seat.folded ? "opacity-45" : ""} ${seat.isWinner ? "holdem-fp-opp-winner" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={face} alt="" className="mx-auto h-12 w-12 rounded-full object-cover ring-2 ring-[#c4a574]/45 sm:h-14 sm:w-14" />
                <p className="mt-1 truncate text-center text-[11px] font-semibold text-white drop-shadow">
                  {seat.name}
                </p>
                <p className="text-center text-[10px] text-[#ffe6a0] drop-shadow">${seat.stack}</p>
                <div className="mt-1 flex justify-center gap-1">
                  {seat.folded ? (
                    <span className="text-[9px] uppercase text-white/50">Folded</span>
                  ) : seat.cards && seat.cards.length > 0 ? (
                    seat.cards.slice(0, 2).map((c, i) => (
                      <PlayingCard key={`${seat.playerId}-${c}-${i}`} label={c} tilt={i === 0 ? -8 : 8} />
                    ))
                  ) : (
                    <>
                      <PlayingCard hidden tilt={-10} />
                      <PlayingCard hidden tilt={10} delayMs={30} />
                    </>
                  )}
                </div>
                {seat.streetBet > 0 && !seat.folded ? (
                  <div className="holdem-fp-bet-chips mt-1">
                    <span className="holdem-chip holdem-chip-0" />
                    <span className="text-[9px] text-[#ffe6a0]">${seat.streetBet}</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner */}
      {handOver && winnerName ? (
        <div
          className={`holdem-fp-winner absolute left-1/2 top-[58%] z-40 w-[min(92%,28rem)] -translate-x-1/2 px-4 py-3 text-center ${
            youWon ? "holdem-fp-winner-you" : ""
          }`}
        >
          <p className="font-serif text-2xl text-[#ffe6a0] sm:text-3xl">
            {youWon ? "You win" : `${winnerName} wins`}
            {hv.lastPotWon ? ` $${hv.lastPotWon}` : ""}
          </p>
          {hv.showdownLabel ? <p className="mt-1 text-sm text-[#d8c4a0]">{hv.showdownLabel}</p> : null}
        </div>
      ) : null}

      {/* First-person hero cards in hands */}
      <div className="holdem-fp-hands absolute bottom-0 left-1/2 z-40 flex w-full max-w-xl -translate-x-1/2 flex-col items-center pb-2 pt-10">
        <div className="holdem-fp-sleeves pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-32" aria-hidden />
        {heroCards.length > 0 ? (
          <div className="holdem-fp-hero-cards relative mb-2 flex items-end justify-center gap-2 sm:gap-3">
            {heroCards.map((c, i) => (
              <PlayingCard
                key={`hero-${c}-${i}`}
                label={c}
                hero
                delayMs={80 + i * 70}
                tilt={i === 0 ? -12 : 12}
              />
            ))}
          </div>
        ) : youSeat?.folded ? (
          <p className="mb-3 font-serif text-sm text-[#a89070]">You folded</p>
        ) : null}

        {!handOver && hv.isYourAction ? (
          <p className="mb-2 font-serif text-base tracking-wide text-[#f5e6c0] drop-shadow">
            Take your turn{secondsLeft != null ? ` · ${secondsLeft}s` : ""}
          </p>
        ) : null}

        {hv.isYourAction && !handOver ? (
          <div className="holdem-fp-actions mb-2 flex flex-wrap items-center justify-center gap-2 px-2">
            {hv.canFold ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "fold" })}
                className="holdem-fp-btn rounded-sm border border-white/20 bg-black/55 px-3 py-2 text-left text-[12px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm disabled:opacity-50"
              >
                Fold
              </button>
            ) : null}
            {hv.canCheck ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "check" })}
                className="holdem-fp-btn rounded-sm border border-white/20 bg-black/55 px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm disabled:opacity-50"
              >
                Check
              </button>
            ) : null}
            {hv.canCall ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => void post({ action: "call" })}
                className="holdem-fp-btn rounded-sm border border-white/20 bg-black/55 px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm disabled:opacity-50"
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
                  className="holdem-fp-btn rounded-sm border border-white/20 bg-black/55 px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm disabled:opacity-50"
                >
                  Raise ${minRaise}
                </button>
                <label className="flex items-center gap-1 text-[11px] text-white/80">
                  <span className="uppercase tracking-wide">Amount</span>
                  <input
                    type="number"
                    min={minRaise}
                    max={maxRaise}
                    className="w-14 rounded-sm border border-white/20 bg-black/60 px-1.5 py-1.5 text-white"
                    value={clampedRaise}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isFinite(n)) return;
                      setRaiseTo(Math.min(Math.max(n, minRaise), maxRaise));
                    }}
                  />
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void post({ action: "raise", raiseTo: clampedRaise })}
                    className="rounded-sm border border-white/20 bg-black/55 px-2 py-1.5 disabled:opacity-50"
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
                className="holdem-fp-btn rounded-sm border border-[#e6c78a]/50 bg-[#c4a574]/90 px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-[#1a1208] disabled:opacity-50"
              >
                All in
              </button>
            ) : null}
          </div>
        ) : !handOver ? (
          <p className="mb-3 text-center text-sm text-white/60 drop-shadow">
            {pending
              ? "Updating…"
              : hv.actionOn
                ? `Waiting for ${seats.find((s) => s.playerId === hv.actionOn)?.name ?? "opponent"}${
                    secondsLeft != null ? ` · ${secondsLeft}s` : ""
                  }…`
                : "Waiting…"}
          </p>
        ) : null}

        {hv.canDealNextHand ? (
          <button
            type="button"
            disabled={locked}
            onClick={() => void post({ action: "deal" })}
            className="mb-2 rounded-sm border border-[#c4a574]/60 bg-[#c4a574] px-6 py-2.5 font-serif text-sm font-bold text-[#1a1208] disabled:opacity-50"
          >
            Deal next hand
          </button>
        ) : null}
      </div>
    </div>
  );
}
