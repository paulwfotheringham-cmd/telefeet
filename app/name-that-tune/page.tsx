import type { Metadata } from "next";
import { NameThatTuneClient } from "./name-that-tune-client";

export const metadata: Metadata = {
  title: "Name That Tune! | TeleFeet",
  description:
    "Two-player 80s and 90s music quiz. Hear the intro, then name the artist together or take turns.",
};

export default function NameThatTunePage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <NameThatTuneClient />
    </div>
  );
}
