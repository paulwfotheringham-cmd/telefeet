"use client";

import type { ReactNode } from "react";
import { displayScore } from "@/lib/blackjack/hand";
import type { BlackjackGameState, HandState, SeatState } from "@/lib/blackjack/types";
import { FeltArcText } from "./felt-arc-text";
import { FeltBetCircles } from "./felt-bet-circles";
import { PlayingCardView } from "./playing-card";
import { CardShoe, ChipTray } from "./table-decor";

const AI_LAYOUT = ["bj-seat-0", "bj-seat-1", "bj-seat-3", "bj-seat-4"] as const;

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
    <div className="bj-casino-scene">
      <div className="bj-room" aria-hidden>
        <span className="bj-room-glow" />
        <span className="bj-bokeh b1" />
        <span className="bj-bokeh b2" />
        <span className="bj-bokeh b3" />
        <span className="bj-bokeh b4" />
        <span className="bj-bokeh b5" />
        <span className="bj-bokeh b6" />
        <span className="bj-bokeh b7" />
        <span className="bj-bokeh b8" />
        <span className="bj-bokeh b9" />
        <span className="bj-bokeh b10" />
        <span className="bj-bokeh b11" />
        <span className="bj-bokeh b12" />
      </div>
      <div className="bj-room-vignette" aria-hidden />

      <div className="bj-table-stage">
        <div className="bj-halfmoon">
          <div className="bj-halfmoon-rim" aria-hidden />
          <div className="bj-halfmoon-felt">
            <div className="bj-felt-light" aria-hidden />
            <div className="bj-felt-arc-wrap">
              <FeltArcText />
            </div>
            <FeltBetCircles />
            <ChipTray />
            <CardShoe />

            <div className="bj-dealer-pit">
              <div className="bj-dealer-figure" aria-hidden>
                <span className="bj-dealer-hair" />
                <span className="bj-dealer-face" />
                <span className="bj-dealer-collar" />
                <span className="bj-dealer-bow" />
                <span className="bj-dealer-vest" />
              </div>
              {showHands ? (
                <>
                  <ScoreBadge label="Dealer" score={dealerScore ?? "—"} />
                  <div className="bj-hand-row">
                    {state.dealer.cards.map((card, i) => (
                      <PlayingCardView
                        key={card.dealKey ?? `d-${i}`}
                        card={card}
                        delay={i * 100}
                        size="lg"
                        casino3d
                        dropToSeat
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="bj-dealer-label">Dealer</p>
              )}
            </div>

            {aiSeats.map((seat, index) => (
              <PlayerSpot
                key={seat.id}
                seat={seat}
                className={`bj-seat ${AI_LAYOUT[index] ?? "bj-seat-1"}`}
                showOutcomes={state.phase === "roundComplete"}
                size="sm"
                minimal
              />
            ))}

            {humanSeat && state.phase !== "setup" ? (
              <PlayerSpot
                seat={humanSeat}
                className={`bj-seat bj-seat-2 ${humanActive ? "bj-seat-active" : ""}`}
                showOutcomes={state.phase === "roundComplete"}
                showStake={state.phase === "betting" || heroBet > 0}
                size="xl"
                highlight
              />
            ) : null}

            {banner ? <div className="bj-felt-banner">{banner}</div> : null}
            {controls ? <div className="bj-controls-on-felt">{controls}</div> : null}
          </div>
          <div className="bj-black-rail" aria-hidden />
        </div>
      </div>

      <div className="bj-pov" aria-hidden>
        <span className="bj-pov-arm left">
          <span className="bj-pov-sleeve" />
          <span className="bj-pov-hand" />
        </span>
        <span className="bj-pov-arm right">
          <span className="bj-pov-sleeve" />
          <span className="bj-pov-hand" />
        </span>
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
  minimal,
  size,
}: {
  seat: SeatState;
  className: string;
  showOutcomes: boolean;
  showStake?: boolean;
  highlight?: boolean;
  minimal?: boolean;
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
        <ScoreBadge
          label={seat.isHuman ? "You" : seat.name}
          score={scores}
          highlight={highlight}
          compact={minimal}
        />
      ) : minimal ? (
        <p className="bj-ai-name">{seat.name}</p>
      ) : null}

      {hasCards ? (
        <HandsRow hands={seat.hands} showOutcomes={showOutcomes} showStake={showStake} size={size} />
      ) : seat.pendingBet > 0 ? (
        <p className="bj-pending-chip">${seat.pendingBet}</p>
      ) : minimal ? (
        <span className="bj-side-hands" aria-hidden>
          <span />
          <span />
        </span>
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
