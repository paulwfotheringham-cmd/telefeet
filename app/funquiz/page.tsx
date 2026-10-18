import type { Metadata } from "next";
import { FunQuizClient } from "./funquiz-client";

export const metadata: Metadata = {
  title: "Fun Quiz | Head-to-head general knowledge",
  description:
    "Two-player multiplayer general knowledge quiz with room codes — science, geography, history, and more.",
};

export default function FunQuizPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <FunQuizClient />
    </div>
  );
}
