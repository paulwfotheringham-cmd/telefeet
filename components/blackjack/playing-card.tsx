"use client";

import type { CSSProperties } from "react";
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
  size = "md",
  tilt = 0,
  casino3d = false,
  dropToSeat = false,
}: {
  card: Card;
  className?: string;
  delay?: number;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  tilt?: number;
  casino3d?: boolean;
  /** Animate deal from shoe onto the seat square (Hold'em-style drop). */
  dropToSeat?: boolean;
}) {
  const sizeClass =
    size === "hero"
      ? "bj-card-hero"
      : size === "xl"
        ? "bj-card-xl"
        : size === "lg"
          ? "bj-card-lg"
          : size === "md"
            ? "bj-card-md"
            : size === "sm"
              ? "bj-card-sm"
              : "";
  const style: CSSProperties = {
    animationDelay: `${delay}ms`,
    transform: `rotate(${tilt}deg)`,
  };

  const dropClass = dropToSeat ? "bj-card-drop" : "";
  const shell = casino3d
    ? `holdem-card-deal holdem-card-3d ${dropClass} ${sizeClass}`
    : `bj-card ${sizeClass}`;
  const faceShell = casino3d ? "holdem-card-face" : "bj-card-face";
  const backShell = casino3d ? "holdem-card-face holdem-card-back" : "bj-card-back";

  if (card.faceDown) {
    return (
      <span className={`${shell} ${className}`} style={style} aria-hidden>
        <span className={`${backShell} relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.4rem]`}>
          {!casino3d ? null : (
            <span className="absolute inset-[3px] rounded-[0.28rem] border border-[#c4a574]/40 bg-[radial-gradient(circle_at_center,#2f5f9c_0%,#132d52_70%)]" />
          )}
        </span>
      </span>
    );
  }

  const red = isRedSuit(card.suit);
  const symbol = SUIT_SYMBOL[card.suit];
  const displayRank = card.rank === "T" ? "10" : card.rank;
  const color = red ? "text-red-600" : "text-slate-900";

  if (casino3d) {
    return (
      <span className={`${shell} ${className}`} style={style}>
        <span className={`${faceShell} relative flex h-full w-full flex-col items-start justify-between overflow-hidden rounded-[0.4rem] bg-gradient-to-br from-[#fffaf2] via-[#f2e6d0] to-[#dfd0b4] px-1 py-0.5 sm:px-1.5 sm:py-1`}>
          <span className={`font-serif text-[11px] font-bold leading-none sm:text-sm ${color}`}>
            {displayRank}
            {symbol}
          </span>
          <span className={`self-center font-serif text-2xl leading-none sm:text-3xl ${color}`}>{symbol}</span>
          <span className={`self-end rotate-180 font-serif text-[11px] font-bold leading-none sm:text-sm ${color}`}>
            {displayRank}
            {symbol}
          </span>
        </span>
      </span>
    );
  }

  return (
    <div className={`bj-card bj-card-face ${sizeClass} ${className}`} style={style}>
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