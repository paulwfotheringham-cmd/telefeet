import type { Metadata } from "next";
import { DrawTheOrganClient } from "./draw-the-organ-client";

export const metadata: Metadata = {
  title: "Draw the Organ! | TeleFeet",
  description: "Two players draw organs and bones. The game picks the closer picture after each one.",
};

export default function DrawTheOrganPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheOrganClient />
    </div>
  );
}
