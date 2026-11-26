import type { Metadata } from "next";
import { BlackjackClient } from "./blackjack-client";

export const metadata: Metadata = {
  title: "Blackjack | International Games",
  description: "Premium virtual blackjack — beat the dealer and get to 21.",
};

export default function BlackjackPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_#0a1628_0%,_#030508_45%,_#000_100%)]">
      <BlackjackClient />
    </div>
  );
}