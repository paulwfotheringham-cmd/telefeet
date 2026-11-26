import type { Metadata } from "next";
import { BlackjackClient } from "./blackjack-client";

export const metadata: Metadata = {
  title: "Blackjack | International Games",
  description: "Premium virtual blackjack — beat the dealer and get to 21.",
};

export default function BlackjackPage() {
  return (
    <div className="min-h-[100dvh] bg-[#05070a]">
      <BlackjackClient />
    </div>
  );
}