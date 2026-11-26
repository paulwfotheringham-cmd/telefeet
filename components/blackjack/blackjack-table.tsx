"use client";

import type { ReactNode } from "react";
import { displayScore } from "@/lib/blackjack/hand";
import type { BlackjackGameState, HandState, SeatState } from "@/lib/blackjack/types";
import { FeltArcText } from "./felt-arc-text";
import { PlayingCardView } from "./playing-card";
import { CardShoe, ChipTray } from "./table-decor";

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
  const aiSeats = state.seats.filter((s) => !s.isHuman);
  const humanActive =
    state.phase === "playerTurn" && state.seats[state.activeSeatIndex]?.id === humanSeat?.id;

  const aiLayout = ["bj-ai-far-left", "bj-ai-left", "bj-ai-right", "bj-ai-far-right"];

  return (
    <div className="bj-casino-scene">
      <div className="bj-casino-bokeh" aria-hidden />
      <div className="bj-casino-vignette" aria-hidden />

      <div className="bj-table-stage">
        <div className="bj-oval-rail bj-casino-rail">
          <div className="bj-oval-felt bj-casino-felt">
            <div className="bj-felt-vignette" aria-hidden />
            <div className="bj-felt-arc-wrap">
              <FeltArcText />
            </div>
            <ChipTray />
            <CardShoe />

            <div className="bj-dealer-pit bj-spot">
              <div className="bj-dealer-figure" aria-hidden />
              <ScoreBadge label="Dealer" score={dealerScore ?? (showHands ? "—" : "")} />
              {showHands ? (
                <div className="bj-hand-row">
                  {state.dealer.cards.map((card, i) => (
                    <PlayingCardView
                      key={card.dealKey ?? `d-${i}`}
                      card={card}
                      delay={i * 100}
                      size="xl"
                      casino3d
                      dropToSeat
                    />
                  ))}
                </div>
              ) : (
                <p className="bj-dealer-label">Dealer</p>
              )}
            </div>

            {aiSeats.map((seat, index) => (
              <PlayerSpot
                key={seat.id}
                seat={seat}
                className={`bj-spot ${aiLayout[index] ?? "bj-ai-left"}`}
                showHands={showHands || seat.pendingBet > 0}
                showOutcomes={state.phase === "roundComplete"}
                minimal
              />
            ))}

            {humanSeat && state.phase !== "setup" ? (
              <PlayerSpot
                seat={humanSeat}
                className={`bj-spot bj-spot-human-seat bj-player-zone ${humanActive ? "bj-spot-human-active" : ""}`}
                showHands={showHands || humanSeat.pendingBet > 0}
                showOutcomes={state.phase === "roundComplete"}
                showStake={state.phase === "betting"}
                highlight
              />
            ) : null}

            {banner ? <div className="bj-felt-banner">{banner}</div> : null}
            {controls ? <div className="bj-controls-on-felt">{controls}</div> : null}
          </div>
        </div>
      </div>

      <div className="bj-hero-rail" aria-hidden />
    </div>
  );
}

function PlayerSpot({
  seat,
  className,
  showHands,
  showOutcomes,
  showStake,
  highlight,
  minimal,
}: {
  seat: SeatState;
  className: string;
  showHands: boolean;
  showOutcomes: boolean;
  showStake?: boolean;
  highlight?: boolean;
  minimal?: boolean;
}) {
  const scores =
    seat.hands.length > 0 && seat.hands.some((h) => h.cards.length > 0)
      ? seat.hands
          .filter((h) => h.cards.length > 0)
          .map((h) => displayScore(h.cards, true))
          .join(" / ")
      : null;
  const showBadge = scores !== null;

  return (
    <section className={className}>
      {minimal ? <p className="bj-ai-name">{seat.name}</p> : null}
      {showBadge && !minimal ? (
        <ScoreBadge
          label={seat.isHuman ? "You" : seat.name}
          score={scores!}
          highlight={highlight}
          side={seat.isHuman}
        />
      ) : null}
      {seat.hands.some((h) => h.cards.length > 0) ? (
        <HandsRow
          hands={seat.hands}
          showOutcomes={showOutcomes}
          showStake={showStake}
          size={seat.isHuman ? "xl" : "lg"}
        />
      ) : seat.pendingBet > 0 ? (
        <p className="bj-pending-chip">${seat.pendingBet}</p>
      ) : minimal && !showHands ? (
        <span className="bj-side-hand" aria-hidden />
      ) : null}
      {minimal && showBadge ? <span className="bj-ai-score tabular-nums">{scores}</span> : null}
    </section>
  );
}

function ScoreBadge({
  label,
  score,
  highlight,
  side,
}: {
  label: string;
  score: string;
  highlight?: boolean;
  side?: boolean;
}) {
  return (
    <div className={`bj-score-badge ${side ? "bj-score-badge-side" : ""} ${highlight ? "bj-score-badge-you" : ""}`}>
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
  size: "lg" | "xl";
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
                tilt={(i - (hand.cards.length - 1) / 2) * 6}
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
