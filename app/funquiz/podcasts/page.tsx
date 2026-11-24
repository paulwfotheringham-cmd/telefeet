import type { Metadata } from "next";
import { LinkLibrary } from "@/components/funquiz/link-library";

export const metadata: Metadata = {
  title: "Podcasts",
  description: "Add a podcast with its name, web address, and description.",
};

export default function PodcastsPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <LinkLibrary
        kind="podcast"
        title="Podcasts"
        intro="Add a podcast. Enter the name, the web address, and a short description."
      />
    </div>
  );
}
