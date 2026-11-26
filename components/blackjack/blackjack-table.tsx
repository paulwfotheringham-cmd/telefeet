"use client";

import type { ReactNode } from "react";
import type { BlackjackGameState } from "@/lib/blackjack/types";
import { displayScore } from "@/lib/blackjack/hand";
import { FeltArcText } from "./felt-arc-text";
import { PlayingCardView } from "./playing-card";
import { CardShoe, ChipTray } from "./table-decor";
import { TableSeat, type SeatLayout } from "./table-seat";

const AI_LAYOUTS: SeatLayout[] = ["ai-0", "ai-1", "ai-2", "ai-3"];

export function BlackjackTable({
  state,
  controls,
  banner,
  playerId,
  hud,
}: {
  state: BlackjackGameState;
  controls?: ReactNode;
  banner?: ReactNode;
  playerId: string;
  hud?: ReactNode;
}) {
  const showHands =
    state.dealer.cards.length > 0 || state.seats.some((s) => s.hands.some((h) => h.cards.length > 0));
  const showSeats = state.phase !== "setup";
  const dealerRevealed = state.dealerRevealed;
  const dealerScore = showHands && state.dealer.cards.length > 0 ? displayScore(state.dealer.cards, dealerRevealed) : null;

  const humanSeat = state.seats.find((s) => s.isHuman);
  const humanActive =
    state.phase === "playerTurn" && state.seats[state.activeSeatIndex]?.id === humanSeat?.id;

  const aiSeats = state.seats.filter((s) => !s.isHuman);

  const dealerCards = showHands ? (
    <div className="bj-hand-row bj-hand-row-3d">
      {state.dealer.cards.map((card, i) => (
        <PlayingCardView
          key={card.dealKey ?? `d-${i}`}
          card={card}
          delay={i * 95}
          size="md"
          tilt={(i - 0.5) * 8}
          casino3d
          dropToSeat
        />
      ))}
    </div>
  ) : null;

  return (
    <div className="holdem-fp bj-fp relative min-h-[min(90dvh,880px)] w-full overflow-hidden rounded-xl border border-[#5a3d22]/60 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/funquiz/holdem/saloon-plate.jpg"
        alt=""
        className="holdem-fp-plate pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="holdem-fp-grade pointer-events-none absolute inset-0" />
      <div className="holdem-fp-vignette pointer-events-none absolute inset-0" />
      <div className="bj-fp-vegas-wash pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-30 px-3 pt-3 sm:px-5">
        <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#f0d9a8]/85 drop-shadow">
          Vegas Blackjack · 5 seats
        </p>
      </div>

      {showSeats ? (
        <aside className="holdem-fp-roster bj-fp-roster absolute bottom-28 left-2 z-30 w-[11.5rem] sm:bottom-32 sm:left-4 sm:w-[13rem]">
          {hud}
        </aside>
      ) : null}

      <div className="holdem-fp-table bj-fp-table absolute inset-x-0 top-[10%] z-20 mx-auto h-[54%] w-[92%] max-w-4xl sm:top-[9%] sm:h-[58%]">
        <div className="holdem-fp-rail absolute inset-[4%_6%_8%] rounded-[50%]">
          <div className="holdem-fp-felt absolute inset-[7%] rounded-[50%]">
            <div className="bj-felt-vignette pointer-events-none absolute inset-0 rounded-[50%]" aria-hidden />
            <div className="bj-felt-arc-wrap">
              <FeltArcText />
            </div>
            <ChipTray />
            <CardShoe />
          </div>
        </div>

        <TableSeat
          dealerOnly
          layout="dealer"
          playerId={playerId}
          showHands={showHands}
          dealerScore={dealerScore}
          dealerCards={dealerCards}
        />

        {aiSeats.map((seat, index) => {
          const layout = AI_LAYOUTS[index] ?? AI_LAYOUTS[AI_LAYOUTS.length - 1]!;
          const isActive = state.phase === "playerTurn" && state.activeSeatIndex === state.seats.indexOf(seat);
          return (
            <TableSeat
              key={seat.id}
              seat={seat}
              layout={layout}
              playerId={playerId}
              hands={seat.hands}
              showHands={showHands || seat.pendingBet > 0}
              showOutcomes={state.phase === "roundComplete"}
              isActive={isActive}
            />
          );
        })}

        {humanSeat && showSeats ? (
          <TableSeat
            seat={humanSeat}
            layout="hero"
            playerId={playerId}
            hands={humanSeat.hands}
            showHands={showHands || humanSeat.pendingBet > 0}
            showOutcomes={state.phase === "roundComplete"}
            showStake={state.phase === "betting"}
            isActive={humanActive}
            isHuman
          />
        ) : null}
      </div>

      <div className="holdem-fp-hands bj-fp-hands absolute bottom-0 left-1/2 z-40 flex w-full max-w-2xl -translate-x-1/2 flex-col items-center px-2 pb-3 pt-10 sm:pb-4">
        <div className="holdem-fp-sleeves pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-36" aria-hidden />
        {banner ? <div className="relative z-[3] mb-2">{banner}</div> : null}
        {controls ? <div className="relative z-[3] w-full max-w-xl">{controls}</div> : null}
        {state.phase === "betting" && !showHands ? (
          <p className="relative z-[2] mt-1 font-serif text-sm text-[#d8c4a0]/85 drop-shadow">Place your bet on your square</p>
        ) : null}
      </div>
    </div>
  );
}