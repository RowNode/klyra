"use client";

import { FAQSection } from "@/components/faq";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { mockFAQs } from "@/lib/mock-data";
import { CalendarDays, ChartColumnBig, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Footer from "@/components/footer";

export default function Home() {
  const { isConnected } = useAccount();
  const featured = [
    {
      icon: CalendarDays,
      title: "Daily Quest",
      desc: "15.2K Active",
      stat: "22K participants",
    },
    {
      icon: ChartColumnBig,
      title: "Weekly Quest",
      desc: "Higher Rewards",
      stat: "Tackle weekly objectives",
    },
    {
      icon: Trophy,
      title: "Leaderboard",
      desc: "Compete & Rank",
      stat: "Climb the ranks",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-b from-background via-background to-secondary/5 relative max-w-7xl mx-auto">
        {/* Left vertical line */}
        <div className="hidden sm:block w-px h-full absolute left-0 top-0 bg-black z-0"></div>

        {/* Right vertical line */}
        <div className="hidden sm:block w-px h-full absolute right-0 top-0 bg-black z-0"></div>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-balance text-foreground leading-tight">
                  Complete Quests.
                  <br />
                  <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Earn Rewards.
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Join the ultimate DeFi quest platform. Complete on-chain
                  tasks, participate in communities, and earn valuable rewards
                  while climbing the leaderboard.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Link
                      href="/quests"
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        if (!isConnected) {
                          e.preventDefault();
                          openConnectModal();
                        }
                      }}
                    >
                      <Button variant="default">Explore Quests</Button>
                    </Link>
                  )}
                </ConnectButton.Custom>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Link
                      href="/leaderboard"
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        if (!isConnected) {
                          e.preventDefault();
                          openConnectModal();
                        }
                      }}
                    >
                      <Button variant="outline">View Leaderboard</Button>
                    </Link>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/50 backdrop-blur border border-border p-8 space-y-6 rounded-none shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-primary capitalize">
                          Daily
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Swap 10 USDC
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        100 XP
                      </p>
                      <p className="text-xs text-muted-foreground">
                        500 REWARD
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    Complete a token swap of at least 10 USDC on SaucerSwap
                  </p>

                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Trading</span>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-linear-to-r from-primary to-secondary h-2 rounded-full transition-all"
                        style={{ width: `75%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      75% progress
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {/* <span className="text-sm text-muted-foreground">
                      100 participants
                    </span> */}
                    <span className="text-sm font-semibold">24h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="everything-you-need"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Grow fast, organize the chaos, and reward the real contributors.
              This is how you'll keep your community alive and thriving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 border border-border bg-card rounded-none shadow-md"
                >
                  <div className="text-5xl mb-4">
                    <Icon className="size-10" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{item.desc}</p>
                  <p className="text-sm text-primary font-semibold">
                    {item.stat}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about DeFi Quest and how to get
              started
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQSection faqs={mockFAQs} />
          </div>
        </section>

        {/* Featured Quest CTA */}
        <section id="ready-to-begin" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="bg-white/50 backdrop-blur border border-border p-8 rounded-none shadow-md text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Ready to Begin Your Quest?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect your wallet to start earning rewards, complete
                challenges, and join the community of DeFi enthusiasts.
              </p>
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Link
                  href="/quests"
                  onClick={(e) => {
                    if (!isConnected) {
                      e.preventDefault();
                      openConnectModal();
                    }
                  }}
                >
                  <Button variant="default">Start Quest Now</Button>
                </Link>
              )}
            </ConnectButton.Custom>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
