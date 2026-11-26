"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HoldemSeatView } from "@/lib/funquiz/types";

/** Seat roster anchors (for dealer btn). */
const SEAT_ANCHORS = [
  { left: "17%", top: "28%" },
  { left: "24%", top: "36%" },
  { left: "50%", top: "21%" },
  { left: "76%", top: "36%" },
  { left: "50%", top: "68%" },
] as const;

/** Hand positions on the felt in front of each seat. */
const SEAT_HAND_ANCHORS = [
  { left: "21%", top: "41%" },
  { left: "27%", top: "47%" },
  { left: "50%", top: "34%" },
  { left: "73%", top: "47%" },
  { left: "50%", top: "56%" },
] as const;

const POT_CENTER = { left: "50%", top: "44%" };

const FLOP_CARD_OFFSETS = ["-5.5cqw", "0cqw", "5.5cqw"] as const;

type HandAction = {
  id: string;
  seatIdx: number;
  kind: "chip-push" | "muck";
  chipClass: string;
  shiftX: string;
  shiftY: string;
};

const HAND_PUSH_SHIFT: { x: string; y: string }[] = [
  { x: "28cqw", y: "6cqh" },
  { x: "22cqw", y: "-2cqh" },
  { x: "0cqw", y: "10cqh" },
  { x: "-22cqw", y: "-2cqh" },
  { x: "0cqw", y: "-10cqh" },
];

const HAND_MUCK_SHIFT: { x: string; y: string }[] = [
  { x: "18cqw", y: "4cqh" },
  { x: "16cqw", y: "-1cqh" },
  { x: "0cqw", y: "8cqh" },
  { x: "-16cqw", y: "-1cqh" },
  { x: "0cqw", y: "-8cqh" },
];

type Props = {
  seats: HoldemSeatView[];
  pot: number;
  boardLen: number;
  handNumber: number;
  previewScript?: boolean;
};

const CHIP_DENOMS = [100, 25, 5, 1] as const;

function potChipBreakdown(pot: number): { denom: number; count: number; tone: string }[] {
  let left = Math.max(0, pot);
  const out: { denom: number; count: number; tone: string }[] = [];
  const tones: Record<number, string> = { 100: "holdem-chip-gold", 25: "holdem-chip-blue", 5: "holdem-chip-red", 1: "holdem-chip-white" };
  for (const d of CHIP_DENOMS) {
    const count = Math.floor(left / d);
    if (count > 0) {
      const capped = Math.min(count, d >= 25 ? 4 : d === 5 ? 6 : 8);
      out.push({ denom: d, count: capped, tone: tones[d] ?? "holdem-chip-white" });
      left -= capped * d;
    }
  }
  if (out.length === 0 && pot > 0) {
    out.push({ denom: 1, count: Math.min(pot, 3), tone: "holdem-chip-white" });
  }
  return out;
}

function HandMotion({
  action,
  handLeft,
  handTop,
}: {
  action: HandAction;
  handLeft: string;
  handTop: string;
}) {
  return (
    <div
      className={`holdem-motion-hand-action holdem-motion-hand-action-${action.kind}`}
      style={
        {
          left: handLeft,
          top: handTop,
          "--hand-shift-x": action.shiftX,
          "--hand-shift-y": action.shiftY,
        } as React.CSSProperties
      }
    >
      <span className="holdem-motion-player-hand" />
      {action.kind === "chip-push" ? (
        <span className={`holdem-chip holdem-motion-chip-with-hand ${action.chipClass}`} />
      ) : (
        <>
          <span className="holdem-motion-muck-card-felt holdem-motion-muck-card-felt-a" />
          <span className="holdem-motion-muck-card-felt holdem-motion-muck-card-felt-b" />
        </>
      )}
    </div>
  );
}

export function HoldemTableMotion({ seats, pot, boardLen, handNumber, previewScript }: Props) {
  const [flopDealing, setFlopDealing] = useState(false);
  const [dealerShuffling, setDealerShuffling] = useState(false);
  const [handActions, setHandActions] = useState<HandAction[]>([]);
  const [previewPotAmount, setPreviewPotAmount] = useState(0);
  const [dealerButtonSeat, setDealerButtonSeat] = useState(2);
  const [potChipPulse, setPotChipPulse] = useState(0);
  const prevBoard = useRef(0);
  const prevBets = useRef<Record<string, number>>({});
  const prevFolded = useRef<Record<string, boolean>>({});
  const betsHydrated = useRef(false);
  const actionSeq = useRef(0);

  const dealerIdx = useMemo(() => {
    const i = seats.findIndex((s) => s.isDealer);
    return i >= 0 ? i : 2;
  }, [seats]);

  const dealerHand = SEAT_HAND_ANCHORS[dealerIdx % SEAT_HAND_ANCHORS.length]!;

  const queueHandAction = (seatIdx: number, kind: HandAction["kind"], chipClass = "holdem-chip-red") => {
    const shift = kind === "muck" ? HAND_MUCK_SHIFT[seatIdx]! : HAND_PUSH_SHIFT[seatIdx]!;
    actionSeq.current += 1;
    const id = `hand-${actionSeq.current}`;
    const action: HandAction = {
      id,
      seatIdx,
      kind,
      chipClass,
      shiftX: shift.x,
      shiftY: shift.y,
    };
    setHandActions((list) => [...list, action]);
    window.setTimeout(() => setHandActions((list) => list.filter((a) => a.id !== id)), 950);
  };

  useEffect(() => {
    if (previewScript) return;
    if (boardLen > prevBoard.current && boardLen >= 3) {
      setFlopDealing(true);
      const id = window.setTimeout(() => setFlopDealing(false), 1100);
      prevBoard.current = boardLen;
      return () => window.clearTimeout(id);
    }
    prevBoard.current = boardLen;
  }, [boardLen, handNumber, previewScript]);

  useEffect(() => {
    const nextMuck = new Set<number>();
    seats.forEach((seat, idx) => {
      const was = prevFolded.current[seat.playerId];
      if (seat.folded && was === false) {
        nextMuck.add(idx);
      }
      prevFolded.current[seat.playerId] = seat.folded;
    });
    if (nextMuck.size > 0) {
      nextMuck.forEach((idx) => queueHandAction(idx, "muck"));
    }
  }, [seats]);

  useEffect(() => {
    if (previewScript) return;
    if (!betsHydrated.current) {
      seats.forEach((seat) => {
        prevBets.current[seat.playerId] = seat.streetBet;
      });
      betsHydrated.current = true;
      return;
    }
    seats.forEach((seat, idx) => {
      const prev = prevBets.current[seat.playerId] ?? 0;
      const delta = seat.streetBet - prev;
      if (delta > 0) {
        const chipClass = delta >= 25 ? "holdem-chip-blue" : delta >= 5 ? "holdem-chip-red" : "holdem-chip-white";
        queueHandAction(idx, "chip-push", chipClass);
      }
      prevBets.current[seat.playerId] = seat.streetBet;
    });
  }, [seats, previewScript]);

  useEffect(() => {
    if (!previewScript) return;
    prevBets.current = {};
    prevFolded.current = {};
    prevBoard.current = 0;

    const steps = [
      () => setDealerButtonSeat(2),
      () => setDealerShuffling(true),
      () => setDealerShuffling(false),
      () => queueHandAction(1, "chip-push"),
      () => {
        setPreviewPotAmount(5);
        setPotChipPulse((p) => p + 1);
      },
      () => queueHandAction(0, "chip-push"),
      () => {
        setPreviewPotAmount(10);
        setPotChipPulse((p) => p + 1);
      },
      () => queueHandAction(4, "chip-push"),
      () => {
        setPreviewPotAmount(17);
        setPotChipPulse((p) => p + 1);
      },
      () => setFlopDealing(true),
      () => queueHandAction(0, "muck"),
      () => setDealerButtonSeat(1),
    ];
    const timers: number[] = [];
    timers.push(window.setTimeout(steps[0]!, 80));
    timers.push(window.setTimeout(steps[1]!, 250));
    timers.push(window.setTimeout(steps[2]!, 1100));
    timers.push(window.setTimeout(steps[3]!, 1300));
    timers.push(window.setTimeout(steps[4]!, 1450));
    timers.push(window.setTimeout(steps[5]!, 2000));
    timers.push(window.setTimeout(steps[6]!, 2150));
    timers.push(window.setTimeout(steps[7]!, 2700));
    timers.push(window.setTimeout(steps[8]!, 2850));
    timers.push(window.setTimeout(steps[9]!, 3500));
    timers.push(window.setTimeout(() => setFlopDealing(false), 4600));
    timers.push(window.setTimeout(steps[10]!, 5000));
    timers.push(window.setTimeout(steps[11]!, 5800));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [previewScript]);

  const displayPot = previewScript ? (pot > 0 ? pot : previewPotAmount) : pot;
  const potStacks = potChipBreakdown(displayPot);

  return (
    <div className="holdem-motion holdem-motion-layer pointer-events-none absolute inset-0 z-[25]" aria-hidden>
      <span
        className="holdem-motion-dealer-btn"
        style={{
          left: SEAT_ANCHORS[dealerButtonSeat % SEAT_ANCHORS.length]!.left,
          top: SEAT_ANCHORS[dealerButtonSeat % SEAT_ANCHORS.length]!.top,
        }}
      />

      <div
        className="holdem-motion-pot absolute flex -translate-x-1/2 items-end justify-center gap-1.5"
        style={{ left: POT_CENTER.left, top: POT_CENTER.top }}
      >
        {potStacks.map((stack, si) => (
          <div key={`${stack.denom}-${si}`} className="holdem-motion-pot-stack relative flex flex-col-reverse items-center">
            {Array.from({ length: stack.count }).map((_, ci) => (
              <span
                key={`${potChipPulse}-${stack.denom}-${ci}`}
                className={`holdem-chip holdem-motion-pot-chip ${stack.tone}`}
                style={{ marginTop: ci === 0 ? 0 : -4 }}
              />
            ))}
            {si === potStacks.length - 1 && displayPot > 0 ? (
              <span className="holdem-motion-pot-label mt-1 font-serif text-[11px] tabular-nums text-[#ffe6a0] drop-shadow">
                ${displayPot}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {dealerShuffling ? (
        <div
          className="holdem-motion-hand-action holdem-motion-hand-action-deal"
          style={{ left: dealerHand.left, top: dealerHand.top, "--hand-shift-x": "4cqw", "--hand-shift-y": "12cqh" } as React.CSSProperties}
        >
          <span className="holdem-motion-player-hand holdem-motion-player-hand-dealer" />
          <span className="holdem-motion-player-hand holdem-motion-player-hand-dealer-b" />
        </div>
      ) : null}

      {flopDealing ? (
        <>
          <div
            className="holdem-motion-hand-action holdem-motion-hand-action-flop-dealer"
            style={{ left: dealerHand.left, top: dealerHand.top, "--hand-shift-x": "0cqw", "--hand-shift-y": "14cqh" } as React.CSSProperties}
          >
            <span className="holdem-motion-player-hand holdem-motion-player-hand-dealer" />
          </div>
          {previewScript
            ? ["A♠", "K♦", "7♣"].map((label, i) => (
                <span
                  key={label}
                  className="holdem-motion-board-card"
                  style={
                    {
                      left: "50%",
                      top: "39%",
                      "--board-to-x": FLOP_CARD_OFFSETS[i],
                      animationDelay: `${280 + i * 160}ms`,
                    } as React.CSSProperties
                  }
                >
                  {label}
                </span>
              ))
            : null}
        </>
      ) : null}

      {handActions.map((action) => {
        const h = SEAT_HAND_ANCHORS[action.seatIdx % SEAT_HAND_ANCHORS.length]!;
        return <HandMotion key={action.id} action={action} handLeft={h.left} handTop={h.top} />;
      })}

    </div>
  );
}