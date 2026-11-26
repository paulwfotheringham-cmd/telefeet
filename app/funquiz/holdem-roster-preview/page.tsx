"use client";

import type { HoldemSeatView } from "@/lib/funquiz/types";

const GROUNDED_WEBP = "/funquiz/holdem/holdem-rdr2-mockup-v3-grounded.webp";
const GROUNDED_JPG = "/funquiz/holdem/holdem-rdr2-mockup-v3-grounded.jpg";

const DEMO_SEATS: HoldemSeatView[] = [
  {
    playerId: "you",
    name: "Player",
    stack: 500,
    isAi: false,
    folded: false,
    allIn: false,
    streetBet: 0,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
    isActing: true,
    isWinner: false,
    cards: null,
  },
  {
    playerId: "ai-1",
    name: "AI River",
    stack: 498,
    isAi: true,
    folded: false,
    allIn: false,
    streetBet: 2,
    isDealer: false,
    isSmallBlind: true,
    isBigBlind: false,
    isActing: false,
    isWinner: false,
    cards: null,
  },
  {
    playerId: "ai-2",
    name: "AI Bluff",
    stack: 495,
    isAi: true,
    folded: false,
    allIn: false,
    streetBet: 5,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: true,
    isActing: false,
    isWinner: false,
    cards: null,
  },
  {
    playerId: "ai-3",
    name: "AI Dusty",
    stack: 495,
    isAi: true,
    folded: false,
    allIn: false,
    streetBet: 5,
    isDealer: true,
    isSmallBlind: false,
    isBigBlind: false,
    isActing: false,
    isWinner: false,
    cards: null,
  },
  {
    playerId: "ai-4",
    name: "AI Coyote",
    stack: 495,
    isAi: true,
    folded: false,
    allIn: false,
    streetBet: 5,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
    isActing: false,
    isWinner: false,
    cards: null,
  },
];

function rosterLabel(isYou: boolean, aiNumber: number | null): string {
  if (isYou) return "Player one";
  return `AI player ${aiNumber ?? 1}`;
}

function statusLine(seat: HoldemSeatView, isYou: boolean): string {
  if (seat.isActing) return isYou ? "Your turn…" : "Thinking…";
  if (seat.streetBet > 0) return `Bet $${seat.streetBet}`;
  if (seat.isBigBlind) return "Big blind";
  if (seat.isSmallBlind) return "Small blind";
  if (seat.isDealer) return "Dealer";
  return "";
}

export default function HoldemRosterPreviewPage() {
  const playerId = "you";
  let aiNumber = 0;

  return (
    <main className="min-h-screen bg-black p-2 sm:p-4">
      <section className="holdem-gnd relative mx-auto max-w-6xl overflow-hidden rounded-lg shadow-2xl">
        <div className="holdem-gnd-aspect relative w-full">
          <picture className="holdem-gnd-plate pointer-events-none absolute inset-0 block h-full w-full">
            <source srcSet={GROUNDED_WEBP} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GROUNDED_JPG} alt="" className="h-full w-full object-cover" draggable={false} />
          </picture>
          <div className="holdem-gnd-shade pointer-events-none absolute inset-0" aria-hidden />
          <div className="holdem-gnd-baked-portraits-smear pointer-events-none absolute z-[22]" aria-hidden />
          <aside className="holdem-gnd-roster-rail pointer-events-none absolute z-30">
            <ul className="holdem-gnd-roster-lines">
              {DEMO_SEATS.map((seat) => {
                const isYou = seat.playerId === playerId;
                if (!isYou) aiNumber += 1;
                const label = rosterLabel(isYou, isYou ? null : aiNumber);
                const meta = statusLine(seat, isYou);
                return (
                  <li
                    key={seat.playerId}
                    className={`holdem-gnd-roster-line ${seat.isActing ? "holdem-gnd-roster-active" : ""}`}
                  >
                    <span className="holdem-gnd-roster-name">{label}</span>
                    <span className="holdem-gnd-roster-stack tabular-nums">${seat.stack}</span>
                    {meta ? <span className="holdem-gnd-roster-meta">{meta}</span> : null}
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}