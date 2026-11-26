"use client";

import type { ReactNode } from "react";
import { displayScore } from "@/lib/blackjack/hand";
import type { BlackjackGameState, HandState, SeatState } from "@/lib/blackjack/types";
import { FeltArcText } from "./felt-arc-text";
import { PlayingCardView } from "./playing-card";
import { CardShoe, ChipTray } from "./table-decor";

type Spot = "human" | "ai-left" | "ai-right";

function spotForSeat(seat: SeatState, aiIndex: number): Spot {
  if (seat.isHuman) return "human";
  if (aiIndex === 0) return "ai-left";
  return "ai-right";
}

function seatVisible(seat: SeatState, inRound: boolean): boolean {
  if (seat.isHuman) return inRound;
  if (!inRound) return false;
  return seat.hands.some((h) => h.cards.length > 0);
}

export function BlackjackTable({
  state,
  controls,
  banner,
}: {
  state: BlackjackGameState;
  controls?: ReactNode;
  banner?: ReactNode;
}) {
  const showHands =
    state.dealer.cards.length > 0 || state.seats.some((s) => s.hands.some((h) => h.cards.length > 0));

  const dealerRevealed = state.dealerRevealed;
  const dealerScore = showHands && state.dealer.cards.length > 0 ? displayScore(state.dealer.cards, dealerRevealed) : null;

  const humanSeat = state.seats.find((s) => s.isHuman);
  const humanActive =
    state.phase === "playerTurn" && state.seats[state.activeSeatIndex]?.id === humanSeat?.id;

  let aiCounter = 0;
  const showHumanHero = Boolean(humanSeat && state.phase !== "setup");

  return (
    <div className="bj-fp bj-fp-casino relative mt-1 min-h-[min(88dvh,820px)] w-full overflow-hidden rounded-xl border border-[#5a3d22]/60 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)]">
      <div className="bj-fp-spotlight pointer-events-none absolute inset-0" aria-hidden />
      <div className="bj-fp-grade pointer-events-none absolute inset-0" />
      <div className="bj-fp-vignette pointer-events-none absolute inset-0" />

      <div className="bj-fp-table absolute inset-x-0 top-[8%] z-20 mx-auto h-[56%] w-[94%] max-w-4xl sm:top-[6%] sm:h-[60%]">
        <div className="holdem-fp-rail bj-fp-rail absolute inset-[3%_5%_10%] rounded-[50%]">
          <div className="holdem-fp-felt bj-fp-felt absolute inset-[7%] rounded-[50%]">
            <div className="bj-felt-vignette" aria-hidden />
            <div className="bj-felt-arc-wrap">
              <FeltArcText />
            </div>
            <ChipTray />
            <CardShoe />
          </div>
        </div>

        {/* Dealer — front / middle of table */}
        <div className="bj-fp-dealer absolute left-1/2 top-[14%] z-30 flex -translate-x-1/2 flex-col items-center gap-2">
          {showHands ? (
            <>
              <ScoreBadge label="Dealer" score={dealerScore ?? "—"} />
              <div className="bj-hand-row bj-hand-row-3d">
                {state.dealer.cards.map((card, i) => (
                  <PlayingCardView
                    key={card.dealKey ?? `d-${i}`}
                    card={card}
                    delay={i * 90}
                    size="lg"
                    tilt={(i - 0.5) * 8}
                    casino3d
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#cfe3d4]/45">Dealer</p>
          )}
        </div>

        {state.seats.map((seat) => {
          if (seat.isHuman || !seatVisible(seat, showHands)) return null;
          const aiIndex = aiCounter++;
          const spot = spotForSeat(seat, aiIndex);
          const isActive = state.phase === "playerTurn" && state.activeSeatIndex === state.seats.indexOf(seat);
          const scores =
            seat.hands.length > 0
              ? seat.hands
                  .filter((h) => h.cards.length > 0)
                  .map((h) => displayScore(h.cards, true))
                  .join(" / ")
              : null;

          return (
            <div
              key={seat.id}
              className={`bj-fp-ai-seat bj-fp-ai-${spot} absolute z-30 flex flex-col items-center gap-1`}
            >
              <ScoreBadge label={seat.name} score={scores ?? "—"} />
              <HandsRow
                hands={seat.hands}
                human={false}
                active={isActive}
                showOutcomes={state.phase === "roundComplete"}
                showStake={false}
                casino3d
              />
            </div>
          );
        })}
      </div>

      {/* Hero zone — your hand + actions (poker-style) */}
      <div className="bj-fp-hands absolute bottom-0 left-1/2 z-40 flex w-full max-w-2xl -translate-x-1/2 flex-col items-center px-2 pb-3 pt-16 sm:pb-4">
        <div className="holdem-fp-sleeves bj-fp-sleeves pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-36" aria-hidden />

        {showHumanHero ? (
          <div className="holdem-fp-hero-cards relative z-[2] mb-3 flex w-full items-end justify-center gap-3">
            {humanSeat!.hands.some((h) => h.cards.length > 0) ? (
              <HandsRow
                hands={humanSeat!.hands}
                human
                active={humanActive}
                showOutcomes={state.phase === "roundComplete"}
                showStake={state.phase === "betting"}
                casino3d
                hero
              />
            ) : humanSeat!.pendingBet > 0 ? (
              <p className="bj-pending-chip text-lg">${humanSeat!.pendingBet}</p>
            ) : null}
            {humanSeat!.hands.some((h) => h.cards.length > 0) ? (
              <ScoreBadge
                label="You"
                score={humanSeat!.hands
                  .filter((h) => h.cards.length > 0)
                  .map((h) => displayScore(h.cards, true))
                  .join(" / ")}
                highlight
                align="side"
              />
            ) : null}
          </div>
        ) : !showHands ? (
          <p className="relative z-[2] mb-2 font-serif text-sm text-[#d8c4a0]/80 drop-shadow">Place your bet to begin</p>
        ) : null}

        {banner ? <div className="relative z-[3] mb-2">{banner}</div> : null}
        {controls ? <div className="relative z-[3] w-full max-w-xl">{controls}</div> : null}
      </div>
    </div>
  );
}

function ScoreBadge({
  label,
  score,
  highlight,
  align = "stack",
}: {
  label: string;
  score: string;
  highlight?: boolean;
  align?: "stack" | "side";
}) {
  return (
    <div
      className={`bj-score-badge ${align === "side" ? "bj-score-badge-side" : ""} ${highlight ? "bj-score-badge-you" : ""}`}
    >
      <span className="bj-score-label">{label}</span>
      <strong className="bj-score-value">{score}</strong>
    </div>
  );
}

function HandsRow({
  hands,
  human,
  active,
  showOutcomes,
  showStake,
  casino3d,
  hero,
}: {
  hands: HandState[];
  human: boolean;
  active: boolean;
  showOutcomes: boolean;
  showStake?: boolean;
  casino3d?: boolean;
  hero?: boolean;
}) {
  return (
    <div className={`bj-hands-row ${human && active ? "bj-hands-active" : ""}`}>
      {hands.map((hand) => (
        <div key={hand.id} className="bj-hand-cluster">
          <div className="bj-hand-row bj-hand-row-3d">
            {hand.cards.map((card, i) => (
              <PlayingCardView
                key={card.dealKey ?? `${hand.id}-${i}`}
                card={card}
                delay={i * 70}
                size={hero ? "hero" : human ? "xl" : "lg"}
                tilt={hero ? (i === 0 ? -10 : 10) : (i - (hand.cards.length - 1) / 2) * 7}
                casino3d={casino3d}
              />
            ))}
          </div>
          {showStake && hand.bet > 0 && !showOutcomes ? <span className="bj-hand-stake">${hand.bet}</span> : null}
          {showOutcomes && hand.outcomeLabel ? (
            <span className={`bj-hand-result bj-outcome-${hand.outcome ?? "none"}`}>{hand.outcomeLabel}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}