"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HoldemSeatView } from "@/lib/funquiz/types";

/** Table positions aligned to grounded v3 mockup (clockwise from left opponent). */
const SEAT_ANCHORS = [
  { left: "17%", top: "28%" },
  { left: "24%", top: "36%" },
  { left: "50%", top: "21%" },
  { left: "76%", top: "36%" },
  { left: "50%", top: "68%" },
] as const;

const POT_CENTER = { left: "50%", top: "44%" };

type ChipFlight = {
  id: string;
  fromLeft: string;
  fromTop: string;
  chipClass: string;
  shiftX: string;
  shiftY: string;
};

/** Seat index → container shift toward pot center (cqw/cqh). */
const SEAT_TO_POT_SHIFT: { x: string; y: string }[] = [
  { x: "33cqw", y: "16cqh" },
  { x: "26cqw", y: "8cqh" },
  { x: "0cqw", y: "23cqh" },
  { x: "-26cqw", y: "8cqh" },
  { x: "0cqw", y: "-24cqh" },
];

const DEAL_CARD_SHIFT = { x: "0cqw", y: "47cqh" };

type Props = {
  seats: HoldemSeatView[];
  pot: number;
  boardLen: number;
  handNumber: number;
  /** Scripted preview: auto-play flop, chips, fold. */
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

export function HoldemTableMotion({ seats, pot, boardLen, handNumber, previewScript }: Props) {
  const [flopDealing, setFlopDealing] = useState(false);
  const [dealingHole, setDealingHole] = useState(false);
  const [muckSeats, setMuckSeats] = useState<Set<number>>(new Set());
  const [flights, setFlights] = useState<ChipFlight[]>([]);
  const [previewPotAmount, setPreviewPotAmount] = useState(0);
  const [dealerButtonSeat, setDealerButtonSeat] = useState(2);
  const [potChipPulse, setPotChipPulse] = useState(0);
  const prevBoard = useRef(0);
  const prevBets = useRef<Record<string, number>>({});
  const prevFolded = useRef<Record<string, boolean>>({});
  const flightSeq = useRef(0);

  const dealerIdx = useMemo(() => {
    const i = seats.findIndex((s) => s.isDealer);
    return i >= 0 ? i : 0;
  }, [seats]);

  const dealerAnchor = SEAT_ANCHORS[dealerIdx % SEAT_ANCHORS.length]!;

  useEffect(() => {
    if (previewScript) return;
    if (boardLen > prevBoard.current && boardLen >= 3) {
      setFlopDealing(true);
      const id = window.setTimeout(() => setFlopDealing(false), 950);
      prevBoard.current = boardLen;
      return () => window.clearTimeout(id);
    }
    prevBoard.current = boardLen;
  }, [boardLen, handNumber]);

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
      setMuckSeats(nextMuck);
      const id = window.setTimeout(() => setMuckSeats(new Set()), 900);
      return () => window.clearTimeout(id);
    }
  }, [seats]);

  useEffect(() => {
    const newFlights: ChipFlight[] = [];
    seats.forEach((seat, idx) => {
      const prev = prevBets.current[seat.playerId] ?? 0;
      const delta = seat.streetBet - prev;
      if (delta > 0) {
        const anchor = SEAT_ANCHORS[idx % SEAT_ANCHORS.length]!;
        const chipClass =
          delta >= 25 ? "holdem-chip-blue" : delta >= 5 ? "holdem-chip-red" : "holdem-chip-white";
        flightSeq.current += 1;
        const shift = SEAT_TO_POT_SHIFT[idx % SEAT_TO_POT_SHIFT.length] ?? SEAT_TO_POT_SHIFT[0]!;
        newFlights.push({
          id: `f-${flightSeq.current}`,
          fromLeft: anchor.left,
          fromTop: anchor.top,
          chipClass,
          shiftX: shift.x,
          shiftY: shift.y,
        });
      }
      prevBets.current[seat.playerId] = seat.streetBet;
    });
    if (newFlights.length > 0) {
      setFlights((f) => [...f, ...newFlights]);
      const id = window.setTimeout(() => {
        setFlights((f) => f.filter((x) => !newFlights.some((n) => n.id === x.id)));
      }, 920);
      return () => window.clearTimeout(id);
    }
  }, [seats]);

  useEffect(() => {
    if (!previewScript) return;
    prevBets.current = {};
    prevFolded.current = {};
    prevBoard.current = 0;
    const launchFlight = (seatIdx: number, id: string) => {
      const anchor = SEAT_ANCHORS[seatIdx % SEAT_ANCHORS.length]!;
      const shift = SEAT_TO_POT_SHIFT[seatIdx] ?? SEAT_TO_POT_SHIFT[0]!;
      setFlights((f) => [
        ...f,
        {
          id,
          fromLeft: anchor.left,
          fromTop: anchor.top,
          chipClass: "holdem-chip-red",
          shiftX: shift.x,
          shiftY: shift.y,
        },
      ]);
      window.setTimeout(() => setFlights((f) => f.filter((x) => x.id !== id)), 950);
    };

    const steps = [
      () => setDealerButtonSeat(2),
      () => setDealingHole(true),
      () => launchFlight(1, "preview-blind"),
      () => {
        setPreviewPotAmount(5);
        setPotChipPulse((p) => p + 1);
      },
      () => launchFlight(0, "preview-bb"),
      () => {
        setPreviewPotAmount(10);
        setPotChipPulse((p) => p + 1);
      },
      () => launchFlight(4, "preview-call"),
      () => {
        setPreviewPotAmount(17);
        setPotChipPulse((p) => p + 1);
      },
      () => setFlopDealing(true),
      () => setMuckSeats(new Set([0])),
      () => setDealerButtonSeat(1),
    ];
    const timers: number[] = [];
    timers.push(window.setTimeout(steps[0]!, 80));
    timers.push(window.setTimeout(steps[1]!, 200));
    timers.push(window.setTimeout(() => setDealingHole(false), 900));
    timers.push(window.setTimeout(steps[2]!, 1100));
    timers.push(window.setTimeout(steps[3]!, 1250));
    timers.push(window.setTimeout(steps[4]!, 1900));
    timers.push(window.setTimeout(steps[5]!, 2050));
    timers.push(window.setTimeout(steps[6]!, 2600));
    timers.push(window.setTimeout(steps[7]!, 2750));
    timers.push(window.setTimeout(steps[8]!, 3400));
    timers.push(window.setTimeout(() => setFlopDealing(false), 4400));
    timers.push(window.setTimeout(steps[9]!, 4800));
    timers.push(window.setTimeout(() => setMuckSeats(new Set()), 5700));
    timers.push(window.setTimeout(steps[10]!, 5800));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [previewScript]);

  const displayPot = previewScript ? (pot > 0 ? pot : previewPotAmount) : pot;
  const potStacks = potChipBreakdown(displayPot);
  const heroAnchor = SEAT_ANCHORS[4]!;

  return (
    <div className="holdem-motion holdem-motion-layer pointer-events-none absolute inset-0 z-[25]" aria-hidden>
      <span
        className="holdem-motion-dealer-btn"
        style={{
          left: SEAT_ANCHORS[dealerButtonSeat % SEAT_ANCHORS.length]!.left,
          top: SEAT_ANCHORS[dealerButtonSeat % SEAT_ANCHORS.length]!.top,
        }}
      />
      {/* Center pot — stacked denoms */}
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

      {dealingHole
        ? [0, 1].map((i) => (
            <span
              key={`deal-${i}`}
              className="holdem-motion-deal-card"
              style={
                {
                  left: dealerAnchor.left,
                  top: dealerAnchor.top,
                  "--holdem-shift-x": DEAL_CARD_SHIFT.x,
                  "--holdem-shift-y": DEAL_CARD_SHIFT.y,
                  animationDelay: `${i * 120}ms`,
                } as React.CSSProperties
              }
            />
          ))
        : null}

      {flopDealing ? (
        <>
          <span
            className="holdem-motion-dealer-hand"
            style={{ left: dealerAnchor.left, top: dealerAnchor.top }}
          />
          {previewScript
            ? ["A♠", "K♦", "7♣"].map((label, i) => (
                <span
                  key={label}
                  className="holdem-motion-board-card"
                  style={{ left: `${46 + i * 4}%`, top: "36%", animationDelay: `${200 + i * 140}ms` }}
                >
                  {label}
                </span>
              ))
            : null}
        </>
      ) : null}

      {flights.map((f) => (
        <span
          key={f.id}
          className={`holdem-chip holdem-motion-chip-fly ${f.chipClass}`}
          style={
            {
              left: f.fromLeft,
              top: f.fromTop,
              "--holdem-shift-x": f.shiftX,
              "--holdem-shift-y": f.shiftY,
            } as React.CSSProperties
          }
        />
      ))}

      {Array.from(muckSeats).map((idx) => {
        const a = SEAT_ANCHORS[idx % SEAT_ANCHORS.length]!;
        return (
          <div
            key={`muck-${idx}`}
            className="holdem-motion-muck"
            style={{ left: a.left, top: a.top }}
          >
            <span className="holdem-motion-muck-card holdem-motion-muck-a" />
            <span className="holdem-motion-muck-card holdem-motion-muck-b" />
          </div>
        );
      })}
    </div>
  );
}