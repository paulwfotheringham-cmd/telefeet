import type { Metadata } from "next";
import { NameThatStarClient } from "./name-that-star-client";

export const metadata: Metadata = {
  title: "Hollywood faces | International Games",
  description: "Name the person in the picture. The faces are famous, but not the easiest ones.",
};

export default function NameThatStarPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <NameThatStarClient />
    </div>
  );
}
