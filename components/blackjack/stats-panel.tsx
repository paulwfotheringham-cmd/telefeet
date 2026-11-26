"use client";

import type { SessionStats } from "@/lib/blackjack/types";

export function StatsPanel({ stats, currentBet }: { stats: SessionStats; currentBet: number }) {
  return (
    <aside className="bj-panel">
      <h2 className="bj-panel-title">
        <StatsIcon />
        Game stats
      </h2>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Balance" value={`$${stats.balance}`} highlight />
        <Row label="Current bet" value={`$${currentBet}`} />
        <Row label="Games played" value={String(stats.gamesPlayed)} />
        <Row label="Wins" value={String(stats.wins)} />
        <Row label="Losses" value={String(stats.losses)} />
        <Row label="Pushes" value={String(stats.pushes)} />
        <Row
          label="Session P/L"
          value={`${stats.sessionPl >= 0 ? "+" : ""}$${stats.sessionPl}`}
          highlight={stats.sessionPl !== 0}
        />
      </dl>
    </aside>
  );
}

function StatsIcon() {
  return (
    <svg className="bj-panel-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="14" width="4" height="6" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="10" y="10" width="4" height="10" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="16" y="6" width="4" height="14" rx="1" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-brand-line/60 pb-2">
      <dt className="text-brand-muted">{label}</dt>
      <dd className={`font-semibold tabular-nums ${highlight ? "text-brand-goldHi" : "text-brand-cream"}`}>
        {value}
      </dd>
    </div>
  );
}