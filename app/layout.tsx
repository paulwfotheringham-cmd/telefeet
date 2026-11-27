import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { ClubGate } from "@/components/club-gate";
import { Games311AnalyticsProvider } from "@/components/games311/analytics-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fun Quiz",
  description: "Two-player multiplayer general knowledge quiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClubGate>
          <Suspense fallback={null}>
            <Games311AnalyticsProvider>{children}</Games311AnalyticsProvider>
          </Suspense>
        </ClubGate>
      </body>
    </html>
  );
}
