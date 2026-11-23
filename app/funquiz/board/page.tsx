import type { Metadata } from "next";
import { ScoreBoard } from "@/components/funquiz/score-board";

export const metadata: Metadata = {
  title: "All-time board | Fun Quiz",
  description: "Every Fun Quiz player and a leaderboard for each game.",
};

export default function FunQuizBoardPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <ScoreBoard />
    </div>
  );
}
