"use client";

import { displayScore } from "@/lib/blackjack/hand";
import type { BlackjackGameState } from "@/lib/blackjack/types";
import { PlayingCardView } from "./playing-card";

export function BlackjackTable({ state }: { state: BlackjackGameState }) {
  const dealerRevealed = state.dealerRevealed;
  const dealerScore = displayScore(state.dealer.cards, dealerRevealed);

  return (
    <div className="bj-table-wrap">
      <div className="bj-table-felt">
        <p className="bj-table-marking">Blackjack pays 3 to 2</p>
        <p className="bj-table-sub">Dealer hits soft 17 · Insurance pays 2 to 1</p>

        <section className="bj-dealer-zone">
          <div className="bj-score-pill">
            <span className="label">Dealer</span>
            <span className="value">{dealerScore}</span>
          </div>
          <div className="bj-hand-row">
            {state.dealer.cards.map((card, i) => (
              <PlayingCardView key={card.dealKey ?? `d-${i}`} card={card} delay={i * 80} />
            ))}
          </div>
        </section>

        <section className="bj-seats">
          {state.seats.map((seat, seatIdx) => {
            const isActive =
              state.phase === "playerTurn" &&
              state.activeSeatIndex === seatIdx &&
              seat.isHuman;
            return (
              <article
                key={seat.id}
                className={`bj-seat ${seat.isHuman ? "bj-seat-human" : ""} ${isActive ? "bj-seat-active" : ""}`}
              >
                <div className="bj-score-pill">
                  <span className="label">{seat.isHuman ? "You" : seat.name}</span>
                  <span className="value">
                    {seat.hands.length === 0
                      ? "—"
                      : seat.hands.map((h) => displayScore(h.cards, true)).join(" / ")}
                  </span>
                </div>
                <div className="bj-hands-grid">
                  {seat.hands.map((hand) => (
                    <div key={hand.id} className="bj-hand-stack">
                      <div className="bj-hand-row">
                        {hand.cards.map((card, i) => (
                          <PlayingCardView key={card.dealKey ?? `${hand.id}-${i}`} card={card} delay={i * 60} />
                        ))}
                      </div>
                      {hand.bet > 0 ? (
                        <p className="bj-hand-bet">
                          ${hand.bet}
                          {hand.doubled ? " · doubled" : ""}
                        </p>
                      ) : null}
                      {hand.outcomeLabel ? (
                        <p className={`bj-outcome bj-outcome-${hand.outcome ?? "none"}`}>{hand.outcomeLabel}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}