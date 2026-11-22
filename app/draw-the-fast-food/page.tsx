import type { Metadata } from "next";
import { DrawTheFastFoodClient } from "./draw-the-fast-food-client";

export const metadata: Metadata = {
  title: "Draw the Fast Food! | TeleFeet",
  description: "Two players draw fast food. The game picks the closer picture after each one.",
};

export default function DrawTheFastFoodPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950 via-slate-950 to-black">
      <DrawTheFastFoodClient />
    </div>
  );
}
