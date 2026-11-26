"use client";

import type { ReactNode } from "react";

type Props = {
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
};

export function GameControls({
  canHit,
  canStand,
  canDouble,
  canSplit,
  onHit,
  onStand,
  onDouble,
  onSplit,
}: Props) {
  const any = canHit || canStand || canDouble || canSplit;
  if (!any) return null;

  return (
    <div className="bj-controls">
      <ActionBtn
        label="Hit"
        active={canHit}
        onClick={onHit}
        accent="hit"
        icon={<HitIcon />}
      />
      <ActionBtn label="Stand" active={canStand} onClick={onStand} icon={<StandIcon />} />
      <ActionBtn label="Double" active={canDouble} onClick={onDouble} icon={<DoubleIcon />} />
      <ActionBtn label="Split" active={canSplit} onClick={onSplit} icon={<SplitIcon />} />
    </div>
  );
}

function ActionBtn({
  label,
  active,
  onClick,
  accent,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: "hit";
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={!active}
      onClick={onClick}
      className={`bj-action ${accent === "hit" && active ? "bj-action-hit" : ""} ${active ? "" : "bj-action-off"}`}
    >
      <span className="bj-action-icon" aria-hidden>
        {icon}
      </span>
      <span className="bj-action-label">{label}</span>
    </button>
  );
}

function HitIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="6" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="4" width="14" height="18" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 10h5M16 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function StandIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M8 22V12c0-1.5 2.5-2 5-2s5 .5 5 2v10M18 22V14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M14 8V5M14 5h-2.5M14 5h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DoubleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <text x="6" y="20" fill="currentColor" fontSize="13" fontWeight="700" fontFamily="system-ui,sans-serif">
        2×
      </text>
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="8" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="15" y="8" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 6v16" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}