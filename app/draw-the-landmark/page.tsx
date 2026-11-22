import type { Metadata } from "next";
import { DrawTheLandmarkClient } from "./draw-the-landmark-client";

export const metadata: Metadata = {
  title: "Draw the Landmark! | TeleFeet",
  description: "Two players draw famous landmarks. The game picks the closer picture after each one.",
};

export default function DrawTheLandmarkPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheLandmarkClient />
    </div>
  );
}
