import type { Metadata } from "next";
import { GdpClient } from "./gdp-client";

export const metadata: Metadata = {
  title: "European GDP | International Games",
  description: "Put European countries in order by the size of their economies.",
};

export default function GdpPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <GdpClient />
    </div>
  );
}
