import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "AI × Moving Image Research Radar",
  description: "A private research-intelligence briefing for AI, moving image, and artist rights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-serif bg-paper text-ink min-h-screen">
        <Nav />
        <main className="max-w-3xl mx-auto px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
