"use client";

import { isRedSuit } from "@/lib/blackjack/deck";
import type { PlayingCard as Card } from "@/lib/blackjack/types";

const SUIT_SYMBOL: Record<Card["suit"], string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣",
};

export function PlayingCardView({
  card,
  className = "",
  delay = 0,
}: {
  card: Card;
  className?: string;
  delay?: number;
}) {
  if (card.faceDown) {
    return (
      <div
        className={`bj-card bj-card-back ${className}`}
        style={{ animationDelay: `${delay}ms` }}
        aria-hidden
      />
    );
  }

  const red = isRedSuit(card.suit);
  const symbol = SUIT_SYMBOL[card.suit];
  const displayRank = card.rank === "T" ? "10" : card.rank;

  return (
    <div
      className={`bj-card bj-card-face ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`bj-card-corner top ${red ? "red" : "black"}`}>
        <span className="rank">{displayRank}</span>
        <span className="suit">{symbol}</span>
      </span>
      <span className={`bj-card-center ${red ? "red" : "black"}`}>{symbol}</span>
      <span className={`bj-card-corner bottom ${red ? "red" : "black"}`}>
        <span className="rank">{displayRank}</span>
        <span className="suit">{symbol}</span>
      </span>
    </div>
  );
}