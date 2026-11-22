import type { Metadata } from "next";
import { DrawTheMythClient } from "./draw-the-myth-client";

export const metadata: Metadata = {
  title: "Draw the Myth! | TeleFeet",
  description: "Two players draw mythical creatures. The game picks the closer picture after each one.",
};

export default function DrawTheMythPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950 via-slate-950 to-black">
      <DrawTheMythClient />
    </div>
  );
}
