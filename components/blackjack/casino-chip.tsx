"use client";

import type { ChipDenomination } from "@/lib/blackjack/constants";

const CHIP_STYLES: Record<number, { bg: string; ring: string; text: string }> = {
  5: { bg: "#6b7280", ring: "#9ca3af", text: "#f9fafb" },
  10: { bg: "#1e3a5f", ring: "#60a5fa", text: "#e0f2fe" },
  25: { bg: "#14532d", ring: "#4ade80", text: "#ecfdf5" },
  50: { bg: "#581c87", ring: "#c084fc", text: "#faf5ff" },
  100: { bg: "#7f1d1d", ring: "#f87171", text: "#fff1f2" },
  250: { bg: "#4c1d95", ring: "#a78bfa", text: "#f5f3ff" },
  500: { bg: "#0f172a", ring: "#fbbf24", text: "#fef3c7" },
};

export function CasinoChip({
  value,
  selected,
  onClick,
  size = "md",
  displayOnly,
}: {
  value: ChipDenomination | number;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  displayOnly?: boolean;
}) {
  const style = CHIP_STYLES[value] ?? CHIP_STYLES[25]!;
  const dim = size === "sm" ? "h-9 w-9 text-[10px]" : "h-12 w-12 text-xs";
  const className = `bj-chip ${dim} ${selected ? "bj-chip-selected" : ""}`;
  const chipStyle = {
    background: `radial-gradient(circle at 35% 30%, ${style.ring}, ${style.bg})`,
    color: style.text,
  };

  if (displayOnly) {
    return (
      <span className={className} style={chipStyle} aria-hidden>
        {value}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={chipStyle}
      aria-pressed={selected}
      aria-label={`$${value} chip`}
    >
      {value}
    </button>
  );
}