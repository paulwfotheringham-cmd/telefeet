"use client";

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
      <ActionBtn label="Hit" sub="Draw" active={canHit} onClick={onHit} accent="hit" />
      <ActionBtn label="Stand" sub="Hold" active={canStand} onClick={onStand} />
      <ActionBtn label="Double" sub="2×" active={canDouble} onClick={onDouble} />
      <ActionBtn label="Split" sub="Pair" active={canSplit} onClick={onSplit} />
    </div>
  );
}

function ActionBtn({
  label,
  sub,
  active,
  onClick,
  accent,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
  accent?: "hit";
}) {
  return (
    <button
      type="button"
      disabled={!active}
      onClick={onClick}
      className={`bj-action ${accent === "hit" && active ? "bj-action-hit" : ""} ${active ? "" : "bj-action-off"}`}
    >
      <span className="text-sm font-bold tracking-wide">{label}</span>
      <span className="text-[10px] uppercase text-brand-muted">{sub}</span>
    </button>
  );
}