import type { Metadata } from "next";
import { DrawTheCountryClient } from "./draw-the-country-client";

export const metadata: Metadata = {
  title: "Draw the Country! | TeleFeet",
  description: "Two players draw the shape of a country. The game picks the closer picture after each one.",
};

export default function DrawTheCountryPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheCountryClient />
    </div>
  );
}
