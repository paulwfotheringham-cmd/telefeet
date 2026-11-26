"use client";

const CIRCLES = [
  "bj-bet-circle bj-bet-far-left",
  "bj-bet-circle bj-bet-left",
  "bj-bet-circle bj-bet-center",
  "bj-bet-circle bj-bet-right",
  "bj-bet-circle bj-bet-far-right",
] as const;

export function FeltBetCircles() {
  return (
    <div className="bj-bet-circles" aria-hidden>
      {CIRCLES.map((className) => (
        <span key={className} className={className} />
      ))}
    </div>
  );
}