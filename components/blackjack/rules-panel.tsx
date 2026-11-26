"use client";

import { useState } from "react";

const RULES = [
  { title: "Blackjack", body: "Ace plus a 10-value card on the first two cards pays 3:2." },
  { title: "Card values", body: "Number cards count at face value. Face cards count as 10. Ace counts as 11 or 1." },
  { title: "Hit", body: "Take another card. You may hit until you stand or bust over 21." },
  { title: "Stand", body: "Keep your hand and end your turn." },
  { title: "Double down", body: "Double your bet, receive exactly one more card, then stand." },
  { title: "Split", body: "Matching-value pairs may be split into two hands with an equal bet on each." },
  { title: "Dealer rules", body: "Dealer hits soft 17, otherwise stands on 17 or higher." },
  { title: "Payouts", body: "Winning hands pay 1:1. Blackjack pays 3:2. Ties return your bet (push)." },
];

export function RulesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="bj-panel">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h2 className="bj-panel-title">Rules</h2>
        <span className="text-xs text-brand-gold">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <ul className="mt-3 space-y-3 text-sm text-brand-cream/90">
          {RULES.map((rule) => (
            <li key={rule.title}>
              <p className="font-semibold text-brand-goldHi">{rule.title}</p>
              <p className="mt-0.5 text-brand-muted">{rule.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-brand-muted">Tap to read full table rules.</p>
      )}
    </aside>
  );
}