"use client";

import type { ReactNode } from "react";
import { displayScore } from "@/lib/blackjack/hand";
import type { BlackjackGameState, HandState, SeatState } from "@/lib/blackjack/types";
import { PlayingCardView } from "./playing-card";
import { CardShoe, ChipTray } from "./table-decor";

type Spot = "dealer" | "human" | "ai-left" | "ai-right";

function spotForSeat(seat: SeatState, humanId: string, aiIndex: number): Spot {
  if (seat.isHuman) return "human";
  if (aiIndex === 0) return "ai-left";
  return "ai-right";
}

function seatVisible(seat: SeatState, inRound: boolean): boolean {
  if (seat.isHuman) return true;
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
    state.phase === "playerTurn" &&
    state.seats[state.activeSeatIndex]?.id === humanSeat?.id;

  let aiCounter = 0;

  return (
    <div className="bj-scene">
      <div className="bj-table-floor" aria-hidden />
      <div className="bj-oval-rail">
        <div className="bj-oval-felt">
          <div className="bj-felt-vignette" aria-hidden />
          <ChipTray />
          <CardShoe />

          <div className="bj-felt-markings">
            <p className="bj-felt-title">Blackjack pays 3 to 2</p>
            <p className="bj-felt-sub">Dealer hits soft 17 · Insurance pays 2 to 1</p>
          </div>

          <section className="bj-spot bj-spot-dealer">
            {showHands ? (
              <>
                <ScoreBadge label="Dealer" score={dealerScore ?? "—"} />
                <div className="bj-hand-row">
                  {state.dealer.cards.map((card, i) => (
                    <PlayingCardView key={card.dealKey ?? `d-${i}`} card={card} delay={i * 90} size="lg" />
                  ))}
                </div>
              </>
            ) : null}
          </section>

          {state.seats.map((seat) => {
            if (!seatVisible(seat, showHands)) return null;
            const aiIndex = seat.isHuman ? -1 : aiCounter++;
            const spot = spotForSeat(seat, state.humanSeatId, aiIndex);
            const isActive =
              state.phase === "playerTurn" && state.activeSeatIndex === state.seats.indexOf(seat);
            const scoreLabel = seat.isHuman ? "You" : seat.name;
            const scores =
              seat.hands.length > 0 && seat.hands.some((h) => h.cards.length > 0)
                ? seat.hands
                    .filter((h) => h.cards.length > 0)
                    .map((h) => displayScore(h.cards, true))
                    .join(" / ")
                : seat.isHuman && seat.pendingBet > 0 && !showHands
                  ? "—"
                  : null;
            const showBadge = scores !== null;

            return (
              <section
                key={seat.id}
                className={`bj-spot bj-spot-${spot} ${seat.isHuman ? "bj-spot-human-seat" : ""} ${isActive && seat.isHuman ? "bj-spot-active" : ""} ${humanActive && seat.isHuman ? "bj-spot-human-active" : ""}`}
              >
                {seat.isHuman && (showHands || humanActive) ? <span className="bj-player-glow" aria-hidden /> : null}
                {showBadge ? <ScoreBadge label={scoreLabel} score={scores} highlight={seat.isHuman} /> : null}
                {seat.hands.length > 0 ? (
                  <HandsRow hands={seat.hands} human={seat.isHuman} active={isActive} />
                ) : seat.isHuman && seat.pendingBet > 0 && !showHands ? (
                  <p className="bj-pending-chip">${seat.pendingBet}</p>
                ) : null}
              </section>
            );
          })}

          {controls ? <div className="bj-control-dock">{controls}</div> : null}
          {banner ? <div className="bj-table-banner">{banner}</div> : null}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ label, score, highlight }: { label: string; score: string; highlight?: boolean }) {
  return (
    <div className={`bj-score-badge ${highlight ? "bj-score-badge-you" : ""}`}>
      <span>{label}</span>
      <strong>{score}</strong>
    </div>
  );
}

function HandsRow({
  hands,
  human,
  active,
}: {
  hands: HandState[];
  human: boolean;
  active: boolean;
}) {
  return (
    <div className={`bj-hands-row ${human && active ? "bj-hands-active" : ""}`}>
      {hands.map((hand) => (
        <div key={hand.id} className="bj-hand-cluster">
          <div className="bj-hand-row">
            {hand.cards.map((card, i) => (
              <PlayingCardView
                key={card.dealKey ?? `${hand.id}-${i}`}
                card={card}
                delay={i * 70}
                size="lg"
              />
            ))}
          </div>
          {hand.bet > 0 ? <span className="bj-hand-stake">${hand.bet}</span> : null}
          {hand.outcomeLabel ? (
            <span className={`bj-hand-result bj-outcome-${hand.outcome ?? "none"}`}>{hand.outcomeLabel}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}