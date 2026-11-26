"use client";

import type { ReactNode } from "react";
import { displayScore } from "@/lib/blackjack/hand";
import type { BlackjackGameState, HandState, SeatState } from "@/lib/blackjack/types";
import { PlayingCardView } from "./playing-card";

/** Hotspot classes for 5 player seats along the curved rail (photo plate). */
const AI_LAYOUT = ["bj-live-seat-0", "bj-live-seat-1", "bj-live-seat-3", "bj-live-seat-4"] as const;

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
  const dealerScore =
    showHands && state.dealer.cards.length > 0 ? displayScore(state.dealer.cards, dealerRevealed) : null;

  const humanSeat = state.seats.find((s) => s.isHuman);
  const aiSeats = state.seats.filter((s) => !s.isHuman);
  const humanActive =
    state.phase === "playerTurn" && state.seats[state.activeSeatIndex]?.id === humanSeat?.id;

  const heroBet =
    (humanSeat?.pendingBet ?? 0) || (humanSeat?.hands.reduce((sum, h) => sum + h.bet, 0) ?? 0);

  return (
    <div className="bj-live">
      {/* Photoreal first-person table from the user’s reference video */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/funquiz/blackjack/casino-pov-plate.jpg"
        alt=""
        className="bj-live-plate"
        draggable={false}
      />
      <div className="bj-live-grade" aria-hidden />
      <div className="bj-live-vignette" aria-hidden />

      {/* Soft felt scrubs hide baked-in photo cards/chips so live hands read cleanly */}
      <div className="bj-scrub bj-scrub-dealer" aria-hidden />
      <div className="bj-scrub bj-scrub-hero" aria-hidden />
      <div className="bj-scrub bj-scrub-left" aria-hidden />
      <div className="bj-scrub bj-scrub-right" aria-hidden />

      <div className="bj-live-stage">
        <div className="bj-live-dealer">
          {showHands ? (
            <>
              <ScoreBadge label="Dealer" score={dealerScore ?? "—"} />
              <div className="bj-hand-row">
                {state.dealer.cards.map((card, i) => (
                  <PlayingCardView
                    key={card.dealKey ?? `d-${i}`}
                    card={card}
                    delay={i * 90}
                    size="lg"
                    casino3d
                    dropToSeat
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="bj-live-quiet">Dealer</p>
          )}
        </div>

        {aiSeats.map((seat, index) => (
          <PlayerSpot
            key={seat.id}
            seat={seat}
            className={`bj-live-seat ${AI_LAYOUT[index] ?? "bj-live-seat-1"}`}
            showOutcomes={state.phase === "roundComplete"}
            size="sm"
            compact
          />
        ))}

        {humanSeat && state.phase !== "setup" ? (
          <PlayerSpot
            seat={humanSeat}
            className={`bj-live-seat bj-live-seat-2 ${humanActive ? "bj-live-seat-active" : ""}`}
            showOutcomes={state.phase === "roundComplete"}
            showStake={state.phase === "betting" || heroBet > 0}
            size="xl"
            highlight
          />
        ) : null}

        {banner ? <div className="bj-live-banner">{banner}</div> : null}
        {controls ? <div className="bj-live-controls">{controls}</div> : null}
      </div>
    </div>
  );
}

function PlayerSpot({
  seat,
  className,
  showOutcomes,
  showStake,
  highlight,
  compact,
  size,
}: {
  seat: SeatState;
  className: string;
  showOutcomes: boolean;
  showStake?: boolean;
  highlight?: boolean;
  compact?: boolean;
  size: "sm" | "lg" | "xl";
}) {
  const scores =
    seat.hands.length > 0 && seat.hands.some((h) => h.cards.length > 0)
      ? seat.hands
          .filter((h) => h.cards.length > 0)
          .map((h) => displayScore(h.cards, true))
          .join(" / ")
      : null;

  const hasCards = seat.hands.some((h) => h.cards.length > 0);

  return (
    <section className={className}>
      {scores ? (
        <ScoreBadge label={seat.isHuman ? "You" : seat.name} score={scores} highlight={highlight} compact={compact} />
      ) : compact ? (
        <p className="bj-live-quiet">{seat.name}</p>
      ) : null}

      {hasCards ? (
        <HandsRow hands={seat.hands} showOutcomes={showOutcomes} showStake={showStake} size={size} />
      ) : seat.pendingBet > 0 ? (
        <p className="bj-pending-chip">${seat.pendingBet}</p>
      ) : null}
    </section>
  );
}

function ScoreBadge({
  label,
  score,
  highlight,
  compact,
}: {
  label: string;
  score: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`bj-score-badge ${compact ? "bj-score-badge-compact" : ""} ${highlight ? "bj-score-badge-you" : ""}`}
    >
      <span className="bj-score-label">{label}</span>
      <strong className="bj-score-value">{score}</strong>
    </div>
  );
}

function HandsRow({
  hands,
  showOutcomes,
  showStake,
  size,
}: {
  hands: HandState[];
  showOutcomes: boolean;
  showStake?: boolean;
  size: "sm" | "lg" | "xl";
}) {
  return (
    <div className="bj-hands-row">
      {hands.map((hand) => (
        <div key={hand.id} className="bj-hand-cluster">
          <div className="bj-hand-row">
            {hand.cards.map((card, i) => (
              <PlayingCardView
                key={card.dealKey ?? `${hand.id}-${i}`}
                card={card}
                delay={i * 80}
                size={size}
                tilt={(i - (hand.cards.length - 1) / 2) * 5}
                casino3d
                dropToSeat
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
