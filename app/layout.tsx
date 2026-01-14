import type React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {
  DM_Sans as V0_Font_DM_Sans,
  Space_Mono as V0_Font_Space_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

// Initialize fonts
const _dmSans = V0_Font_DM_Sans({
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ],
});
const _spaceMono = V0_Font_Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Klyra - Complete Quests, Earn Rewards",
  description:
    "Join the ultimate DeFi quest platform. Complete on-chain tasks and earn rewards.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-mono antialiased`}>
        <Providers>
          {/* <Navbar /> */}
          {children}
          {/* <Footer /> */}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
