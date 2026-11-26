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
  return label.includes("♥") || label.includes("♦") ? "text-red-700" : "text-[#1a1410]";
}

function PlayingCard({
  label,
  hidden,
  large,
  delayMs = 0,
  tilt = 0,
  ghost = false,
}: {
  label?: string;
  hidden?: boolean;
  large?: boolean;
  delayMs?: number;
  tilt?: number;
  ghost?: boolean;
}) {
  const size = large
    ? "h-[5.75rem] w-[4.05rem] sm:h-[7.25rem] sm:w-[5.1rem]"
    : "h-[2.85rem] w-[2.05rem] sm:h-12 sm:w-[2.15rem]";
  const style: CSSProperties = {
    animationDelay: `${delayMs}ms`,
    transform: `rotate(${tilt}deg)`,
    opacity: ghost ? 0.35 : 1,
  };

  if (hidden || !label) {
    return (
      <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
        <span className="holdem-card-face holdem-card-back relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.45rem]">
          <span className="absolute inset-[3px] rounded-[0.32rem] border border-[#c4a574]/35 bg-[repeating-linear-gradient(135deg,#3d2918_0_3px,#1c120c_3px_6px)]" />
          <span className="relative z-[1] font-serif text-[9px] tracking-widest text-[#d7b57a]/70 sm:text-[10px]">
            ♦
          </span>
        </span>
      </span>
    );
  }

  const rank = label.slice(0, -1);
  const suit = label.slice(-1);
  return (
    <span className={`holdem-card-deal holdem-card-3d inline-flex ${size}`} style={style}>
      <span className="holdem-card-face relative flex h-full w-full flex-col items-start justify-between overflow-hidden rounded-[0.45rem] bg-gradient-to-br from-[#fffaf0] via-[#f3ead8] to-[#e4d5bc] px-1 py-0.5 sm:px-1.5 sm:py-1">
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

function seatStatus(seat: HoldemSeatView, street: string): string {
  if (seat.isWinner && street === "hand_over") return "Winner";
  if (seat.folded) return "Folded";
  if (seat.isActing) return "Your turn…";
  if (seat.allIn) return "All in";
  if (seat.streetBet > 0) return `Bet $${seat.streetBet}`;
  if (seat.isBigBlind) return "Big blind";
  if (seat.isSmallBlind) return "Small blind";
  if (seat.isDealer) return "Dealer";
  return "In hand";
}

function tableSeatStyle(index: number, total: number): CSSProperties {
  // Opponents only — arc across the far side of the table
  const t = total <= 1 ? 0.5 : index / Math.max(1, total - 1);
  const angle = Math.PI * (0.2 + t * 0.6);
  const x = 50 + Math.cos(angle) * 36;
  const y = 34 - Math.sin(angle) * 22;
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
    youSeat && !youSeat.folded && youSeat.cards && youSeat.cards.length > 0
      ? youSeat.cards.slice(0, 2)
      : hv.yourCards?.slice(0, 2) ?? [];
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

  const onGender = (next: HoldemFaceGender) => {
    setGender(next);
    writeFaceGender(next);
  };

  return (
    <div className="holdem-saloon relative mt-1 overflow-hidden rounded-[1.25rem] border border-[#6b4c2a]/55 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]">
      <div className="holdem-saloon-bg pointer-events-none absolute inset-0" />
      <div className="holdem-saloon-lamps pointer-events-none absolute inset-0" />
      <div className="holdem-saloon-vignette pointer-events-none absolute inset-0" />

      {/* Top bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3 pt-3 sm:px-5">
        <div>
          <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#e6c78a]/90">
            Saloon Hold&apos;em · Hand #{hv.handNumber}
          </p>
          <p className="mt-0.5 text-[12px] text-[#d8c4a0]/75">
            Blinds ${hv.smallBlind}/${hv.bigBlind} · Max raise ${hv.maxRaiseSize ?? 25} · Room{" "}
            {roomState.code}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {secondsLeft != null && hv.actionOn ? (
            <span
              className={`rounded border px-2.5 py-1 font-serif text-sm tabular-nums ${
                secondsLeft <= 10
                  ? "border-red-500/50 bg-red-950/70 text-red-100"
                  : "border-[#c4a574]/40 bg-black/45 text-[#f0d9a8]"
              }`}
            >
              {secondsLeft}s
            </span>
          ) : null}
          <div className="rounded border border-[#c4a574]/25 bg-black/40 p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => onGender("male")}
              className={`rounded px-2 py-1 ${gender === "male" ? "bg-[#c4a574] text-[#1a1208]" : "text-[#d8c4a0]"}`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => onGender("female")}
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
              className="rounded border border-[#c4a574]/30 bg-black/40 px-3 py-1.5 text-[11px] text-[#d8c4a0] disabled:opacity-50"
            >
              Leave
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 grid gap-3 px-2 pb-3 pt-2 sm:grid-cols-[13.5rem_minmax(0,1fr)] sm:gap-4 sm:px-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* LHS roster — RDR2 style */}
        <aside className="holdem-roster order-2 sm:order-1">
          <p className="mb-2 px-1 font-serif text-[10px] uppercase tracking-[0.3em] text-[#c4a574]/70">
            Players
          </p>
          <ul className="space-y-2">
            {seats.map((seat) => {
              const isYou = seat.playerId === playerId;
              const g = faceGenderForSeat(seat.playerId, isYou, gender);
              const face = holdemFaceUrl(seat.playerId, g);
              const status = seatStatus(
                {
                  ...seat,
                  isActing: seat.isActing && isYou ? seat.isActing : seat.isActing && !isYou,
                },
                hv.street,
              );
              const statusLabel =
                seat.isActing && isYou
                  ? "Your turn…"
                  : seat.isActing
                    ? "Thinking…"
                    : status;
              return (
                <li
                  key={seat.playerId}
                  className={`holdem-roster-row flex items-center gap-2.5 px-2 py-2 ${
                    seat.isWinner
                      ? "holdem-roster-winner"
                      : seat.isActing
                        ? "holdem-roster-acting"
                        : seat.folded
                          ? "opacity-55"
                          : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={face} alt="" className="holdem-avatar h-10 w-10 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-lg leading-tight text-[#f4ead4] tabular-nums">
                      ${seat.stack}
                    </p>
                    <p className="truncate text-[11px] text-[#d8c4a0]/85">
                      {isYou ? "You" : seat.name}
                      {seat.isDealer ? " · D" : ""}
                    </p>
                    <p
                      className={`truncate text-[10px] ${
                        seat.isWinner
                          ? "font-semibold text-[#ffe6a0]"
                          : seat.isActing
                            ? "text-[#f0d9a8]"
                            : "text-[#a89070]"
                      }`}
                    >
                      {seat.isWinner && hv.lastPotWon
                        ? `Won $${hv.lastPotWon}`
                        : statusLabel}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Table + HUD */}
        <div className="order-1 sm:order-2">
          {/* Top-right community HUD */}
          <div className="mb-2 flex flex-wrap items-start justify-end gap-3">
            <div className="holdem-hud rounded-md border border-[#c4a574]/25 bg-black/45 px-2.5 py-2 backdrop-blur-sm">
              <div className="flex gap-1">
                {boardSlots.map((c, i) =>
                  c ? (
                    <PlayingCard key={`hud-${c}-${i}`} label={c} delayMs={i * 40} />
                  ) : (
                    <span
                      key={`hud-empty-${i}`}
                      className="inline-flex h-[2.85rem] w-[2.05rem] rounded-[0.4rem] border border-dashed border-[#c4a574]/30 bg-black/25 sm:h-12 sm:w-[2.15rem]"
                    />
                  ),
                )}
              </div>
              <p className="mt-1.5 text-right font-serif text-sm text-[#f0d9a8]">
                Pot ${hv.pot}
                <span className="ml-2 text-[10px] uppercase tracking-widest text-[#a89070]">
                  {hv.street.replace("_", " ")}
                </span>
              </p>
            </div>
          </div>

          <div className="holdem-scene relative mx-auto w-full max-w-3xl">
            <div className="holdem-table-wrap relative mx-auto aspect-[5/3.2] w-full">
              <div className="holdem-table-floor absolute inset-[12%_8%_2%] rounded-[50%]" />
              <div className="holdem-table-rail absolute inset-[6%] rounded-[50%]">
                <div className="holdem-table-felt absolute inset-[8%] rounded-[50%]">
                  <div className="holdem-felt-sheen absolute inset-0 rounded-[50%]" />
                  <div className="holdem-felt-rim absolute inset-[6%] rounded-[50%]" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div
                      className={`holdem-pot-chips relative h-8 w-16 ${flashPot ? "holdem-pot-pulse" : ""}`}
                      aria-hidden
                    >
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className="holdem-chip absolute left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-full"
                          style={{ bottom: i * 2.5, zIndex: i + 1, marginLeft: (i - 2) * 3 }}
                        />
                      ))}
                    </div>
                    <p
                      className={`font-serif text-2xl font-semibold tabular-nums text-[#ffe6a0] drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] sm:text-3xl ${flashPot ? "holdem-pot-pulse" : ""}`}
                    >
                      ${hv.pot}
                    </p>
                    <div className="mt-1 flex min-h-[3rem] flex-wrap items-end justify-center gap-1.5">
                      {hv.board.length > 0 ? (
                        hv.board.map((c, i) => (
                          <PlayingCard key={`${c}-${i}`} label={c} delayMs={i * 70} tilt={(i - 2) * 1.5} />
                        ))
                      ) : (
                        <p className="font-serif text-[11px] uppercase tracking-[0.25em] text-[#9fbfa8]/45">
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
                    className="absolute z-20 w-[6.5rem] sm:w-32"
                    style={tableSeatStyle(index, others.length)}
                  >
                    <div
                      className={`holdem-seat flex flex-col items-center px-1.5 py-1.5 ${
                        seat.folded ? "holdem-seat-folded" : seat.isActing ? "holdem-seat-acting" : ""
                      } ${seat.isWinner ? "holdem-seat-winner" : ""}`}
                    >
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={face}
                          alt=""
                          className="holdem-avatar h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12"
                        />
                        {seat.isDealer ? (
                          <span className="holdem-dealer-btn absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-[#1a1208]">
                            D
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 max-w-full truncate text-center text-[10px] font-semibold text-[#f4ead4]">
                        {seat.name}
                      </p>
                      <p className="text-[10px] tabular-nums text-[#e6c78a]">${seat.stack}</p>
                      <div className="mt-0.5 flex gap-0.5">
                        {seat.folded ? (
                          <span className="text-[9px] uppercase text-[#a89070]">Folded</span>
                        ) : seat.cards && seat.cards.length > 0 ? (
                          seat.cards.slice(0, 2).map((c, i) => (
                            <PlayingCard
                              key={`${seat.playerId}-${c}-${i}`}
                              label={c}
                              delayMs={i * 50}
                              tilt={i === 0 ? -8 : 8}
                            />
                          ))
                        ) : (
                          <>
                            <PlayingCard hidden delayMs={0} tilt={-10} />
                            <PlayingCard hidden delayMs={30} tilt={10} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Winner banner */}
          {handOver && winnerName ? (
            <div className={`holdem-winner-banner mx-auto mt-2 max-w-xl px-3 py-3 text-center ${youWon ? "holdem-winner-you" : ""}`}>
              <p className="font-serif text-xl text-[#ffe6a0] sm:text-2xl">
                {youWon ? "You win" : `${winnerName} wins`}
                {hv.lastPotWon ? ` $${hv.lastPotWon}` : ""}
              </p>
              {hv.showdownLabel ? (
                <p className="mt-0.5 text-sm text-[#d8c4a0]">{hv.showdownLabel}</p>
              ) : null}
              {hv.lastHandSummary ? (
                <p className="mt-1 text-[11px] text-[#a89070]">{hv.lastHandSummary}</p>
              ) : null}
            </div>
          ) : null}

          {/* Hero cards — held at bottom like RDR2 */}
          {heroCards.length > 0 && !youSeat?.folded ? (
            <div className="holdem-hero relative z-10 -mt-1 mb-1 flex justify-center gap-2 sm:gap-3">
              {heroCards.map((c, i) => (
                <PlayingCard
                  key={`hero-${c}-${i}`}
                  label={c}
                  large
                  delayMs={90 + i * 80}
                  tilt={i === 0 ? -10 : 10}
                />
              ))}
            </div>
          ) : youSeat?.folded ? (
            <p className="mb-2 text-center font-serif text-sm text-[#a89070]">You folded</p>
          ) : null}

          {!handOver && hv.isYourAction ? (
            <p className="mb-2 text-center font-serif text-base tracking-wide text-[#f0d9a8]">
              Take your turn
              {secondsLeft != null ? ` · ${secondsLeft}s` : ""}
            </p>
          ) : null}

          {/* Actions — bottom right cluster feel */}
          {hv.isYourAction && !handOver ? (
            <div className="holdem-actions ml-auto flex max-w-xl flex-wrap items-center justify-end gap-2 px-1 pb-1">
              {hv.canFold ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "fold" })}
                  className="holdem-btn rounded border border-red-400/40 bg-gradient-to-b from-[#5a1e1e] to-[#2a0d0d] px-4 py-2.5 text-sm font-semibold text-[#ffd0d0] disabled:opacity-50"
                >
                  Fold
                </button>
              ) : null}
              {hv.canCheck ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "check" })}
                  className="holdem-btn rounded border border-[#c4a574]/35 bg-gradient-to-b from-[#3a2e22] to-[#1c1510] px-4 py-2.5 text-sm font-semibold text-[#f4ead4] disabled:opacity-50"
                >
                  Check
                </button>
              ) : null}
              {hv.canCall ? (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void post({ action: "call" })}
                  className="holdem-btn rounded border border-emerald-700/50 bg-gradient-to-b from-[#2f6b45] to-[#163825] px-4 py-2.5 text-sm font-semibold text-[#e8ffe8] disabled:opacity-50"
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
                    className="holdem-btn rounded border border-[#c4a574]/50 bg-gradient-to-b from-[#7a5a28] to-[#3a2a12] px-4 py-2.5 text-sm font-semibold text-[#ffe6a0] disabled:opacity-50"
                  >
                    Raise ${minRaise}
                  </button>
                  <label className="flex items-center gap-1.5 text-xs text-[#d8c4a0]">
                    <span className="text-[10px] uppercase tracking-wide text-[#a89070]">Amount</span>
                    <input
                      type="number"
                      min={minRaise}
                      max={maxRaise}
                      className="w-16 rounded border border-[#c4a574]/30 bg-black/55 px-2 py-2 text-[#f4ead4]"
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
                      className="holdem-btn rounded border border-[#c4a574]/35 px-3 py-2 text-[#f4ead4] disabled:opacity-50"
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
                  className="holdem-btn rounded border border-[#e6c78a]/60 bg-gradient-to-b from-[#e6c78a] to-[#a67c2a] px-4 py-2.5 text-sm font-bold text-[#1a1208] disabled:opacity-50"
                >
                  All in
                </button>
              ) : null}
            </div>
          ) : !handOver ? (
            <p className="pb-2 text-center font-serif text-sm text-[#a89070]">
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
              className="holdem-btn mx-auto mt-2 block w-full max-w-md rounded border border-[#c4a574]/50 bg-gradient-to-b from-[#c4a574] to-[#8a6a2f] py-3 font-serif text-sm font-bold text-[#1a1208] disabled:opacity-50"
            >
              Deal next hand
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
