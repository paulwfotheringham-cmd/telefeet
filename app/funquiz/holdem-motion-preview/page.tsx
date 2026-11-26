"use client";

import { HoldemTableMotion } from "@/components/funquiz/holdem-table-motion";
import type { HoldemSeatView } from "@/lib/funquiz/types";

const GROUNDED_WEBP = "/funquiz/holdem/holdem-rdr2-mockup-v3-grounded.webp";
const GROUNDED_JPG = "/funquiz/holdem/holdem-rdr2-mockup-v3-grounded.jpg";

const DEMO_SEATS: HoldemSeatView[] = [
  {
    playerId: "ai-1",
    name: "AI River",
    stack: 498,
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
    playerId: "ai-2",
    name: "AI Bluff",
    stack: 495,
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
    playerId: "ai-3",
    name: "AI Dusty",
    stack: 500,
    isAi: true,
    folded: false,
    allIn: false,
    streetBet: 0,
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
    stack: 500,
    isAi: true,
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
    playerId: "you",
    name: "You",
    stack: 500,
    isAi: false,
    folded: false,
    allIn: false,
    streetBet: 0,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
    isActing: false,
    isWinner: false,
    cards: ["Q♦", "9♥"],
  },
];

export default function HoldemMotionPreviewPage() {
  return (
    <main className="min-h-screen bg-black p-4">
      <section className="holdem-gnd relative mx-auto max-w-6xl overflow-hidden rounded-lg shadow-2xl">
        <div className="holdem-gnd-aspect relative w-full">
          <picture className="holdem-gnd-plate pointer-events-none absolute inset-0 block h-full w-full">
            <source srcSet={GROUNDED_WEBP} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GROUNDED_JPG} alt="" className="h-full w-full object-cover" draggable={false} />
          </picture>
          <div className="holdem-gnd-shade pointer-events-none absolute inset-0" aria-hidden />
          <HoldemTableMotion seats={DEMO_SEATS} pot={0} boardLen={0} handNumber={1} previewScript />
        </div>
      </section>
    </main>
  );
}