"use client";

export function ChipTray() {
  return (
    <div className="bj-chip-tray" aria-hidden>
      <span className="bj-chip-tray-rim" />
      <span className="bj-chip-tray-stack red" />
      <span className="bj-chip-tray-stack green" />
      <span className="bj-chip-tray-stack blue" />
    </div>
  );
}

export function CardShoe() {
  return (
    <div className="bj-card-shoe" aria-hidden>
      <div className="bj-card-shoe-body">
        <span className="bj-card-shoe-card" />
        <span className="bj-card-shoe-card offset" />
      </div>
    </div>
  );
}