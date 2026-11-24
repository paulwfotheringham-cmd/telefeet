import type { Metadata } from "next";
import { LinkLibrary } from "@/components/funquiz/link-library";

export const metadata: Metadata = {
  title: "Music",
  description: "Add music with its name, web address, and description.",
};

export default function MusicPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <LinkLibrary
        kind="music"
        title="Music"
        intro="Every saved piece of music, and who added it."
      />
    </div>
  );
}
