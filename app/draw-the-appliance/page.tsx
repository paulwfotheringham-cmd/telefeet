import type { Metadata } from "next";
import { DrawTheApplianceClient } from "./draw-the-appliance-client";

export const metadata: Metadata = {
  title: "Draw the Appliance! | TeleFeet",
  description: "Two players draw household appliances. The game picks the closer picture after each one.",
};

export default function DrawTheAppliancePage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <DrawTheApplianceClient />
    </div>
  );
}
