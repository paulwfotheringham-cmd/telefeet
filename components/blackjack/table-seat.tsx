"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { faceGenderForSeat, holdemFaceUrl, readFaceGender, type HoldemFaceGender } from "@/lib/funquiz/holdem/faces";
import type { HandState, SeatState } from "@/lib/blackjack/types";
import { displayScore } from "@/lib/blackjack/hand";
import { PlayingCardView } from "./playing-card";

export type SeatLayout = "dealer" | "hero" | "ai-0" | "ai-1" | "ai-2" | "ai-3";

/** Five player spots around the semicircle (hero = bottom center). */
export const SEAT_LAYOUT_STYLE: Record<SeatLayout, CSSProperties> = {
  dealer: { left: "50%", top: "10%", transform: "translateX(-50%)" },
  hero: { left: "50%", top: "74%", transform: "translate(-50%, 0)" },
  "ai-0": { left: "6%", top: "48%" },
  "ai-1": { left: "22%", top: "58%" },
  "ai-2": { right: "22%", top: "58%", left: "auto" },
  "ai-3": { right: "6%", top: "48%", left: "auto" },
};

export function TableSeat({
  seat,
  layout,
  playerId,
  hands,
  showHands,
  showOutcomes,
  showStake,
  isActive,
  isHuman,
  dealerScore,
  dealerCards,
  dealerOnly,
}: {
  seat?: SeatState;
  layout: SeatLayout;
  playerId: string;
  hands?: HandState[];
  showHands: boolean;
  showOutcomes?: boolean;
  showStake?: boolean;
  isActive?: boolean;
  isHuman?: boolean;
  dealerScore?: string | null;
  dealerCards?: ReactNode;
  dealerOnly?: boolean;
}) {
  const [gender, setGender] = useState<HoldemFaceGender>("male");
  useEffect(() => {
    setGender(readFaceGender());
  }, []);

  if (dealerOnly) {
    const face = holdemFaceUrl("bj-dealer", "male");
    return (
      <div className="bj-seat bj-seat-dealer absolute z-30 flex flex-col items-center gap-1" style={SEAT_LAYOUT_STYLE.dealer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={face} alt="" className="bj-seat-face h-11 w-11 rounded-full object-cover ring-2 ring-[#c4a574]/55 sm:h-12 sm:w-12" />
        <ScoreBadge label="Dealer" score={dealerScore ?? "—"} />
        <div className="bj-seat-square bj-seat-square-dealer">
          {showHands && dealerCards ? dealerCards : <span className="bj-seat-placeholder text-[9px]">House</span>}
        </div>
      </div>
    );
  }

  if (!seat) return null;

  const faceId = seat.isHuman ? playerId : seat.id;
  const g = faceGenderForSeat(faceId, seat.isHuman, gender);
  const face = holdemFaceUrl(faceId, g);
  const hasCards = hands?.some((h) => h.cards.length > 0) ?? false;
  const score =
    hasCards && hands
      ? hands
          .filter((h) => h.cards.length > 0)
          .map((h) => displayScore(h.cards, true))
          .join(" / ")
      : seat.pendingBet > 0 && !showHands
        ? "—"
        : null;

  const compact = seat.isHuman && hasCards;

  return (
    <div
      className={`bj-seat bj-seat-${layout} absolute z-30 flex w-[7.5rem] flex-col items-center sm:w-32 ${isActive ? "bj-seat-acting" : ""}`}
      style={SEAT_LAYOUT_STYLE[layout]}
    >
      {compact ? null : (
        <div className={`holdem-fp-opp ${!hasCards && showHands ? "opacity-90" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={face} alt="" className="bj-seat-face mx-auto h-10 w-10 rounded-full object-cover ring-2 ring-[#c4a574]/45 sm:h-11 sm:w-11" />
          <p className="mt-0.5 truncate text-center text-[10px] font-semibold text-white drop-shadow">{seat.name}</p>
          {!seat.isHuman ? (
            <p className="text-center text-[9px] text-[#ffe6a0] drop-shadow tabular-nums">${seat.balance}</p>
          ) : null}
        </div>
      )}
      {score && score !== "—" ? <ScoreBadge label={seat.isHuman ? "You" : seat.name} score={score} highlight={isHuman} /> : null}
      <div className={`bj-seat-square ${isHuman ? "bj-seat-square-hero" : ""} ${isActive ? "bj-seat-square-active" : ""}`}>
        {hasCards && hands ? (
          <HandsOnSquare hands={hands} isHuman={!!isHuman} showOutcomes={!!showOutcomes} showStake={!!showStake} />
        ) : seat.pendingBet > 0 ? (
          <div className="bj-seat-bet">
            <span className="holdem-chip holdem-chip-1" />
            <span className="text-[9px] font-bold text-[#ffe6a0]">${seat.pendingBet}</span>
          </div>
        ) : (
          <span className="bj-seat-placeholder">{seat.isHuman ? "Your spot" : "Seat"}</span>
        )}
      </div>
    </div>
  );
}

function HandsOnSquare({
  hands,
  isHuman,
  showOutcomes,
  showStake,
}: {
  hands: HandState[];
  isHuman: boolean;
  showOutcomes: boolean;
  showStake: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {hands.map((hand) => (
        <div key={hand.id} className="flex flex-col items-center">
          <div className="bj-hand-row bj-hand-row-3d">
            {hand.cards.map((card, i) => (
              <PlayingCardView
                key={card.dealKey ?? `${hand.id}-${i}`}
                card={card}
                delay={i * 85}
                size={isHuman ? "lg" : "md"}
                tilt={(i - (hand.cards.length - 1) / 2) * 8}
                casino3d
                dropToSeat
              />
            ))}
          </div>
          {showStake && hand.bet > 0 && !showOutcomes ? (
            <span className="bj-hand-stake mt-0.5 text-[9px]">${hand.bet}</span>
          ) : null}
          {showOutcomes && hand.outcomeLabel ? (
            <span className={`bj-hand-result text-[8px] bj-outcome-${hand.outcome ?? "none"}`}>{hand.outcomeLabel}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ label, score, highlight }: { label: string; score: string; highlight?: boolean }) {
  return (
    <div className={`bj-score-badge ${highlight ? "bj-score-badge-you" : ""}`}>
      <span className="bj-score-label">{label}</span>
      <strong className="bj-score-value">{score}</strong>
    </div>
  );
}
