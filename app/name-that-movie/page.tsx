import type { Metadata } from "next";
import { NameThatMovieClient } from "./name-that-movie-client";

export const metadata: Metadata = {
  title: "Name That Movie! | TeleFeet",
  description:
    "Name the film from a famous quotation. Ten questions, four choices, and a score at the end.",
};

export default function NameThatMoviePage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <NameThatMovieClient />
    </div>
  );
}
