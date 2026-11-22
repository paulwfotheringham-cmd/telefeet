import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClubGate } from "@/components/club-gate";
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
        <ClubGate>{children}</ClubGate>
      </body>
    </html>
  );
}
