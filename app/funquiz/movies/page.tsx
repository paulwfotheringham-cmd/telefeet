import type { Metadata } from "next";
import { LinkLibrary } from "@/components/funquiz/link-library";

export const metadata: Metadata = {
  title: "Movies",
  description: "Saved movies, who added them, and a form to add another.",
};

export default function MoviesPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <LinkLibrary kind="movie" title="Movies" intro="Every saved movie, and who added it." />
    </div>
  );
}
