"use client";

import { CHIP_DENOMINATIONS, MAX_BET, MIN_BET } from "@/lib/blackjack/constants";
import { CasinoChip } from "./casino-chip";

type Props = {
  pendingBet: number;
  balance: number;
  selectedChip: number;
  betPlaced: boolean;
  disabled: boolean;
  onSelectChip: (n: number) => void;
  onAdd: () => void;
  onRemove: () => void;
  onClear: () => void;
  onPlaceBet: () => void;
  onDeal: () => void;
};

export function BettingBar({
  pendingBet,
  balance,
  selectedChip,
  betPlaced,
  disabled,
  onSelectChip,
  onAdd,
  onRemove,
  onClear,
  onPlaceBet,
  onDeal,
}: Props) {
  return (
    <div className="bj-betting-stage">
      <div className="bj-chip-row">
        {CHIP_DENOMINATIONS.map((value) => (
          <CasinoChip
            key={value}
            value={value}
            selected={selectedChip === value}
            onClick={() => onSelectChip(value)}
            size="md"
          />
        ))}
      </div>

      <div className="bj-bet-pill">
        <span className="bj-bet-pill-label">Bet</span>
        <button
          type="button"
          className="bj-bet-pill-btn"
          disabled={disabled || betPlaced}
          onClick={onRemove}
          aria-label="Decrease bet"
        >
          −
        </button>
        <div className="bj-bet-pill-center">
          <CasinoChip value={selectedChip} size="sm" displayOnly />
          <span className="bj-bet-pill-amount">${pendingBet}</span>
        </div>
        <button
          type="button"
          className="bj-bet-pill-btn"
          disabled={disabled || betPlaced}
          onClick={onAdd}
          aria-label="Increase bet"
        >
          +
        </button>
      </div>

      <p className="bj-bet-hint">
        Min ${MIN_BET} · Max ${MAX_BET} · Balance ${balance}
      </p>

      <div className="bj-bet-actions">
        <button type="button" className="bj-btn-ghost" disabled={disabled || betPlaced} onClick={onClear}>
          Clear bet
        </button>
        {!betPlaced ? (
          <button
            type="button"
            className="bj-btn-primary"
            disabled={disabled || pendingBet < MIN_BET || pendingBet > balance}
            onClick={onPlaceBet}
          >
            Place bet
          </button>
        ) : (
          <button type="button" className="bj-btn-deal" disabled={disabled} onClick={onDeal}>
            Deal cards
          </button>
        )}
      </div>
    </div>
  );
}