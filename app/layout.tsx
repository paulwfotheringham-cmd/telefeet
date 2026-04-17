import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BrandLogo } from "@/components/brand-logo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeleFeet by Footworx",
  description: "Telehealth platform for Footworx",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-brand-dark/10 bg-brand-light/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
            <BrandLogo size="sm" />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
