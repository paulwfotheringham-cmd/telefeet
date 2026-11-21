import type { Metadata } from "next";
import { NameThatGameClient } from "./name-that-game-client";

export const metadata: Metadata = {
  title: "Name That Game! | TeleFeet",
  description:
    "Two-player 80s and 90s computer game quiz. One screenshot, then name the game together or take turns.",
};

export default function NameThatGamePage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <NameThatGameClient />
    </div>
  );
}
