import type { Metadata } from "next";
import { NameThatShowClient } from "./name-that-show-client";

export const metadata: Metadata = {
  title: "Name That Show! | TeleFeet",
  description:
    "Two-player UK gameshow theme quiz. Hear the intro, then name the show together or take turns.",
};

export default function NameThatShowPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <NameThatShowClient />
    </div>
  );
}
