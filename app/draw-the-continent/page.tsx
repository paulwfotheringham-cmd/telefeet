import type { Metadata } from "next";
import { DrawTheContinentClient } from "./draw-the-continent-client";

export const metadata: Metadata = {
  title: "Draw the Continent! | TeleFeet",
  description: "Two players draw the seven continents. The game picks the closer picture after each one.",
};

export default function DrawTheContinentPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheContinentClient />
    </div>
  );
}
