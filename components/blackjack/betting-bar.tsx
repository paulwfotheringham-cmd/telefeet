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
    <div className="bj-betting">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CHIP_DENOMINATIONS.map((value) => (
          <CasinoChip
            key={value}
            value={value}
            selected={selectedChip === value}
            onClick={() => onSelectChip(value)}
            size="sm"
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <BetControl
          label="Bet"
          amount={pendingBet}
          onMinus={onRemove}
          onPlus={onAdd}
          disabled={disabled || betPlaced}
        />
        <div className="text-center text-xs text-brand-muted sm:text-left">
          <p>
            Min ${MIN_BET} · Max ${MAX_BET}
          </p>
          <p className="mt-0.5 text-brand-cream/80">Balance ${balance}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
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
            Deal
          </button>
        )}
      </div>
    </div>
  );
}

function BetControl({
  label,
  amount,
  onMinus,
  onPlus,
  disabled,
}: {
  label: string;
  amount: number;
  onMinus: () => void;
  onPlus: () => void;
  disabled: boolean;
}) {
  return (
    <div className="bj-bet-control">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-gold">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" className="bj-bet-step" disabled={disabled} onClick={onMinus} aria-label="Decrease bet">
          −
        </button>
        <span className="min-w-[4rem] text-center text-lg font-bold tabular-nums text-white">${amount}</span>
        <button type="button" className="bj-bet-step" disabled={disabled} onClick={onPlus} aria-label="Increase bet">
          +
        </button>
      </div>
    </div>
  );
}