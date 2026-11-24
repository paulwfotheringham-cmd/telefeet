import type { Metadata } from "next";
import { AfterDarkClient } from "./after-dark-client";

export const metadata: Metadata = {
  title: "After dark | International Games",
  description: "A picture reel for adults. Keep a picture, or move on.",
  robots: { index: false, follow: false },
};

export default function AfterDarkPage() {
  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <AfterDarkClient />
    </div>
  );
}
