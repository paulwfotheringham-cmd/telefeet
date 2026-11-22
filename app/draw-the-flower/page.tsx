import type { Metadata } from "next";
import { DrawTheFlowerClient } from "./draw-the-flower-client";

export const metadata: Metadata = {
  title: "Draw the Flower! | TeleFeet",
  description: "Two players draw flowers. The game picks the closer picture after each one.",
};

export default function DrawTheFlowerPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheFlowerClient />
    </div>
  );
}
