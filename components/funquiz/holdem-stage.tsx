"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ClientRoomState, HoldemSeatView } from "@/lib/funquiz/types";
import { readFaceGender, writeFaceGender, type HoldemFaceGender } from "@/lib/funquiz/holdem/faces";
import { HoldemTableMotion } from "@/components/funquiz/holdem-table-motion";

const GROUNDED_WEBP = "/funquiz/holdem/holdem-rdr2-mockup-v3-grounded.webp";
const GROUNDED_JPG = "/funquiz/holdem/holdem-rdr2-mockup-v3-grounded.jpg";

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
  hero,
  board,
  delayMs = 0,
  tilt = 0,
}: {
  label?: string;
  hidden?: boolean;
  hero?: boolean;
  board?: boolean;
  delayMs?: number;
  tilt?: number;
}) {
  const size = hero
    ? "h-[6.75rem] w-[4.75rem] sm:h-[8.5rem] sm:w-[6rem]"
    : board
      ? "h-[4.5rem] w-[3.2rem] sm:h-[5.25rem] sm:w-[3.75rem]"
      : "h-[2.5rem] w-[1.8rem] sm:h-10 sm:w-7";
  const style: CSSProperties = {
    animationDelay: `${delayMs}ms`,
    transform: `rotate(${tilt}deg)`,
  };

  if (hidden || !label) {
    return (
      <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
        <span className="holdem-card-face holdem-card-back relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.4rem]">
          <span className="absolute inset-[3px] rounded-[0.28rem] border border-[#c4a574]/40 bg-[radial-gradient(circle_at_center,#5a2f18_0%,#2a160c_70%)]" />
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

function rosterDisplayName(isYou: boolean, aiNumber: number | null): string {
  if (isYou) return "Player one";
  return `AI player ${aiNumber ?? 1}`;
}

function seatStatus(seat: HoldemSeatView, street: string, isYou: boolean): string {
  if (seat.isWinner && street === "hand_over") return "Winner";
  if (seat.folded) return "Folded";
  if (seat.isActing) return isYou ? "Your turn…" : "Thinking…";
  if (seat.allIn) return "All in";
  if (seat.streetBet > 0) return `Bet $${seat.streetBet}`;
  if (seat.isBigBlind) return "Big blind";
  if (seat.isSmallBlind) return "Small blind";
  if (seat.isDealer) return "Dealer";
  return "";
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
  const heroCards =
    youSeat && !youSeat.folded && ((youSeat.cards && youSeat.cards.length > 0) || hv.yourCards?.length)
      ? (youSeat.cards?.length ? youSeat.cards : hv.yourCards).slice(0, 2)
      : [];
  const locked = pending || busy;
  const handOver = hv.street === "hand_over";
  const streetLabel = hv.street.replace(/_/g, " ");
  const phaseStatus = handOver
    ? null
    : roomState.statusMessage &&
        !roomState.statusMessage.includes("Blinds posted") &&
        hv.street !== "preflop"
      ? roomState.statusMessage
      : hv.street === "preflop"
        ? `Preflop · Pot $${hv.pot}`
        : `${streetLabel.toUpperCase()} · Pot $${hv.pot}`;
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
    <section
      className="holdem-gnd relative mt-0 w-full overflow-hidden rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
    >
      <div className="holdem-gnd-aspect relative w-full">
        <picture className="holdem-gnd-plate pointer-events-none absolute inset-0 block h-full w-full">
          <source srcSet={GROUNDED_WEBP} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GROUNDED_JPG}
            alt=""
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
        </picture>
        <div className="holdem-gnd-shade pointer-events-none absolute inset-0" aria-hidden />
        {/* Light smear over baked portrait column only — saloon art stays visible */}
        <div className="holdem-gnd-baked-portraits-smear pointer-events-none absolute z-[22]" aria-hidden />
        <HoldemTableMotion
          seats={seats}
          pot={hv.pot}
          boardLen={hv.board.length}
          handNumber={hv.handNumber}
        />

        {/* Gender / leave — low chrome */}
        <div className="absolute right-2 top-2 z-40 flex gap-1.5 sm:right-3 sm:top-3">
          {secondsLeft != null && hv.actionOn ? (
            <span
              className={`rounded px-2 py-0.5 font-serif text-xs tabular-nums ${
                secondsLeft <= 10 ? "bg-red-950/80 text-red-100" : "bg-black/50 text-[#f0d9a8]"
              }`}
            >
              {secondsLeft}s
            </span>
          ) : null}
          <div className="flex gap-1 rounded bg-black/45 p-0.5 text-[10px] backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => {
                setGender("male");
                writeFaceGender("male");
              }}
              className={`rounded px-2 py-1 ${gender === "male" ? "bg-[#c4a574] text-[#1a1208]" : "text-[#e8dcc8]"}`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => {
                setGender("female");
                writeFaceGender("female");
              }}
              className={`rounded px-2 py-1 ${gender === "female" ? "bg-[#c4a574] text-[#1a1208]" : "text-[#e8dcc8]"}`}
            >
              Female
            </button>
            {onLeaveLobby ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => onLeaveLobby()}
                className="rounded px-2 py-1 text-[#e8dcc8] disabled:opacity-50"
              >
                Leave
              </button>
            ) : null}
          </div>
        </div>

        {/* Top-center — single HUD (street, pot, board; no duplicate corners) */}
        <div className="holdem-gnd-topHud pointer-events-none absolute left-1/2 top-[4%] z-30 w-[min(96%,28rem)] -translate-x-1/2 text-center">
          {phaseStatus ? (
            <p
              className={`holdem-gnd-phase font-serif text-sm tracking-wide text-[#f5e6c0] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-base ${
                flashPot ? "holdem-pot-pulse" : ""
              }`}
            >
              {phaseStatus}
            </p>
          ) : null}
          {hv.board.length > 0 ? (
            <div className="mt-2 flex justify-center gap-1 sm:gap-1.5">
              {hv.board.map((c, i) => (
                <PlayingCard key={`board-${c}-${i}`} label={c} board delayMs={i * 50} tilt={(i - 2) * 2} />
              ))}
            </div>
          ) : null}
          {heroCards.length > 0 ? (
            <p className="sr-only" aria-live="polite">
              Your hand: {heroCards.join(" ")}
            </p>
          ) : null}
        </div>

        {heroCards.length > 0 ? (
          <>
            <div className="holdem-gnd-hero-mask pointer-events-none absolute inset-0 z-[28]" aria-hidden />
            <div className="holdem-gnd-hero-cards pointer-events-none absolute bottom-[11.5%] left-1/2 z-[34] flex -translate-x-1/2 gap-1 sm:bottom-[12%] sm:gap-1.5">
              {heroCards.map((c, i) => (
                <PlayingCard key={`hero-${c}-${i}`} label={c} hero delayMs={i * 40} tilt={i === 0 ? -5 : 5} />
              ))}
            </div>
          </>
        ) : null}

        <aside className="holdem-gnd-roster-rail pointer-events-none absolute z-30" aria-label="Players">
          <ul className="holdem-gnd-roster-lines">
            {(() => {
              let aiNumber = 0;
              return seats.map((seat) => {
                const isYou = seat.playerId === playerId;
                const status = seatStatus(seat, hv.street, isYou);
                if (!isYou) aiNumber += 1;
                const label = rosterDisplayName(isYou, isYou ? null : aiNumber);
                const meta =
                  seat.isWinner && hv.lastPotWon ? `+$${hv.lastPotWon}` : status;
                return (
                  <li
                    key={seat.playerId}
                    className={`holdem-gnd-roster-line ${
                      seat.isWinner ? "holdem-gnd-roster-winner" : seat.isActing ? "holdem-gnd-roster-active" : ""
                    } ${seat.folded ? "opacity-50" : ""}`}
                  >
                    <span className="holdem-gnd-roster-name">{label}</span>
                    <span className="holdem-gnd-roster-stack tabular-nums">${seat.stack}</span>
                    {meta ? <span className="holdem-gnd-roster-meta">{meta}</span> : null}
                  </li>
                );
              });
            })()}
          </ul>
        </aside>

        {/* Winner */}
        {handOver && winnerName ? (
          <div
            className={`holdem-gnd-winner absolute left-1/2 top-[14%] z-40 w-[min(90%,24rem)] -translate-x-1/2 px-3 py-2 text-center ${
              youWon ? "holdem-gnd-winner-you" : ""
            }`}
          >
            <p className="font-serif text-xl text-[#ffe6a0] drop-shadow sm:text-2xl">
              {youWon ? "You win" : `${winnerName} wins`}
              {hv.lastPotWon ? ` $${hv.lastPotWon}` : ""}
            </p>
            {hv.showdownLabel ? (
              <p className="mt-0.5 text-sm text-[#e8dcc8] drop-shadow">{hv.showdownLabel}</p>
            ) : null}
          </div>
        ) : null}

        {/* Actions — bottom only (mockup art shows hole cards in hands) */}
        <div className="holdem-gnd-hands absolute bottom-[3%] left-1/2 z-40 flex w-full max-w-xl -translate-x-1/2 flex-col items-center sm:bottom-[4%]">
          {youSeat?.folded ? (
            <p className="mb-2 font-serif text-sm text-white/70 drop-shadow">You folded</p>
          ) : null}

          {!handOver && hv.isYourAction ? (
            <p className="mb-2 font-serif text-base tracking-wide text-[#f5e6c0] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Take your turn{secondsLeft != null ? ` · ${secondsLeft}s` : ""}
            </p>
          ) : null}

          {hv.isYourAction && !handOver ? (
            <div className="mb-1 flex flex-wrap items-center justify-center gap-2 px-2">
              {hv.canFold ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "fold" })}
                  className="holdem-gnd-btn rounded-sm bg-black/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm disabled:opacity-50"
                >
                  Fold
                </button>
              ) : null}
              {hv.canCheck ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "check" })}
                  className="holdem-gnd-btn rounded-sm bg-black/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm disabled:opacity-50"
                >
                  Check
                </button>
              ) : null}
              {hv.canCall ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "call" })}
                  className="holdem-gnd-btn rounded-sm bg-black/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm disabled:opacity-50"
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
                    className="holdem-gnd-btn rounded-sm bg-black/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm disabled:opacity-50"
                  >
                    Raise ${minRaise}
                  </button>
                  <label className="flex items-center gap-1 text-[10px] text-white/85">
                    <span className="uppercase">Amount</span>
                    <input
                      type="number"
                      min={minRaise}
                      max={maxRaise}
                      className="w-14 rounded-sm border border-white/25 bg-black/65 px-1.5 py-1 text-white"
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
                      className="rounded-sm bg-black/60 px-2 py-1 disabled:opacity-50"
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
                  className="holdem-gnd-btn rounded-sm border border-[#e6c78a]/60 bg-[#c9a85a] px-3 py-2 text-[11px] font-bold uppercase text-[#1a1208] disabled:opacity-50"
                >
                  All in
                </button>
              ) : null}
            </div>
          ) : !handOver ? (
            <p className="mb-2 text-center text-xs text-white/65 drop-shadow">
              {pending
                ? "Updating…"
                : hv.actionOn
                  ? `Waiting for ${seats.find((s) => s.playerId === hv.actionOn)?.name ?? "opponent"}${
                      secondsLeft != null ? ` · ${secondsLeft}s` : ""
                    }…`
                  : null}
            </p>
          ) : null}

          {hv.canDealNextHand ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => void post({ action: "deal" })}
              className="mb-2 rounded-sm border border-[#c4a574]/70 bg-[#c4a574] px-6 py-2 font-serif text-sm font-bold text-[#1a1208] disabled:opacity-50"
            >
              Deal next hand
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}