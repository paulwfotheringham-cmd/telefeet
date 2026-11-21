import type { Metadata } from "next";
import { NameThatMovieClient } from "./name-that-movie-client";

export const metadata: Metadata = {
  title: "Name That Movie! | TeleFeet",
  description:
    "Two-player movie quote quiz. Play together or take turns naming the film.",
};

export default function NameThatMoviePage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <NameThatMovieClient />
    </div>
  );
}
