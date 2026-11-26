import type { Metadata } from "next";
import { BlackjackClient } from "./blackjack-client";

export const metadata: Metadata = {
  title: "Blackjack | International Games",
  description: "Premium virtual blackjack — beat the dealer and get to 21.",
};

export default function BlackjackPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,_#1a2838_0%,_#080a10_45%,_#030305_100%)]">
      <BlackjackClient />
    </div>
  );
}