import type { Metadata } from "next";
import { DrawTheAnimalClient } from "./draw-the-animal-client";

export const metadata: Metadata = {
  title: "Draw the Animal! | TeleFeet",
  description: "Two players draw animals. The game picks the closer picture after each one.",
};

export default function DrawTheAnimalPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheAnimalClient />
    </div>
  );
}
