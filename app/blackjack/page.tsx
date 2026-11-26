import type { Metadata } from "next";
import { BlackjackClient } from "./blackjack-client";

export const metadata: Metadata = {
  title: "Blackjack | International Games",
  description: "Premium virtual blackjack — beat the dealer and get to 21.",
};

export default function BlackjackPage() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,_#142238_0%,_#070b12_42%,_#030305_100%)]">
      <BlackjackClient />
    </div>
  );
}