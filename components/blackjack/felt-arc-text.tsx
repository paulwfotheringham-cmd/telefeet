"use client";

export function FeltArcText() {
  return (
    <svg className="bj-felt-arc" viewBox="0 0 520 100" aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <path id="bj-felt-arc-main" d="M 36 78 Q 260 8 484 78" fill="none" />
        <path id="bj-felt-arc-sub" d="M 48 92 Q 260 38 472 92" fill="none" />
      </defs>
      <text className="bj-felt-arc-main">
        <textPath href="#bj-felt-arc-main" startOffset="50%" textAnchor="middle">
          BLACKJACK PAYS 3 TO 2
        </textPath>
      </text>
      <text className="bj-felt-arc-sub">
        <textPath href="#bj-felt-arc-sub" startOffset="50%" textAnchor="middle">
          DEALER HITS SOFT 17 • INSURANCE PAYS 2 TO 1
        </textPath>
      </text>
    </svg>
  );
}