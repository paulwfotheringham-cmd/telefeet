import type { Metadata } from "next";
import { DrawTheGeographyClient } from "./draw-the-geography-client";

export const metadata: Metadata = {
  title: "Draw the Geography! | TeleFeet",
  description: "Two players draw geography features. The game picks the closer picture after each one.",
};

export default function DrawTheGeographyPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheGeographyClient />
    </div>
  );
}
