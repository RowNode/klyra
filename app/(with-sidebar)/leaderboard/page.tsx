"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { transformLeaderboardUser } from "@/lib/utils/quest-transform";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [timeframe, setTimeframe] = useState<"all-time" | "monthly" | "weekly">(
    "all-time"
  );
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/quests/leaderboard?limit=100`);

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data = await response.json();
        const transformed = (data.leaderboard || []).map(
          transformLeaderboardUser
        );

        // Simulate different leaderboards based on timeframe (for now, all-time only)
        // TODO: Add timeframe filtering in backend
        if (timeframe === "weekly") {
          setLeaderboardData(
            transformed.map((user: any) => ({
              ...user,
              totalXP: Math.floor(user.totalXP * 0.15),
              questsCompleted: Math.floor(user.questsCompleted * 0.15),
            }))
          );
        } else if (timeframe === "monthly") {
          setLeaderboardData(
            transformed.map((user: any) => ({
              ...user,
              totalXP: Math.floor(user.totalXP * 0.3),
              questsCompleted: Math.floor(user.questsCompleted * 0.3),
            }))
          );
        } else {
          setLeaderboardData(transformed);
        }
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeframe]);

  if (loading) {
    return (
      <div>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Compete with the community and climb the ranks
          </p>
        </div>
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Compete with the community and climb the ranks
          </p>
        </div>
        <div className="text-center py-20">
          <p className="text-lg text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Get current user's rank and stats
  const currentUser = address
    ? leaderboardData.find(
        (u) => u.wallet.toLowerCase() === address.toLowerCase()
      )
    : null;
  const currentUserXP = currentUser?.totalXP || 0;
  const currentUserRank = currentUser?.rank || leaderboardData.length + 1;

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Not connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Leaderboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Compete with the community and climb the ranks
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-foreground">Top Performer</h2>
          <div className="grid gap-6">
            {leaderboardData.slice(0, 1).map((performer) => (
              <div
                key={performer.rank}
                className="p-8 border-2 border-primary bg-primary text-white"
              >
                <div>
                  {/* Rank Badge */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-5xl">👑</span>
                      <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full">
                        #{performer.rank}
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="mb-4">
                    <p className="text-lg font-bold text-white mb-1">
                      {performer.username}
                    </p>
                    <p className="text-xs text-white/70 font-mono ">
                      {formatAddress(performer.wallet)}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 p-3">
                      <p className="text-xs text-white/70 mb-1">Total XP</p>
                      <p className="text-2xl font-bold text-white">
                        {performer.totalXP.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/10 p-3">
                      <p className="text-xs text-white/70 mb-1">
                        Quests Completed
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {performer.questsCompleted}
                      </p>
                    </div>
                    <div className="bg-white/10 p-3">
                      <p className="text-xs text-white/70 mb-1">
                        Badges Earned
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {performer.badges}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/50 backdrop-blur border border-border p-8 rounded-none shadow-md space-y-8">
            <h3 className="text-sm text-muted-foreground mb-2">
              Total Participants
            </h3>
            <p className="text-3xl font-bold text-primary">
              {leaderboardData.length.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur border border-border p-8 rounded-none shadow-md space-y-8">
            <h3 className="text-sm text-muted-foreground mb-2">Your Rank</h3>
            <p className="text-3xl font-bold text-primary">
              {currentUserRank || "—"}
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur border border-border p-8 rounded-none shadow-md space-y-8">
            <h3 className="text-sm text-muted-foreground mb-2">Your XP</h3>
            <p className="text-3xl font-bold text-primary">
              {currentUserXP.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="border border-border bg-card overflow-hidden shadow-md">
          {/* Header */}
          <div className="bg-linear-to-r from-primary/5 to-secondary/5 p-6 border-b border-border grid grid-cols-12 gap-4 font-semibold text-foreground rounded-none">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3">XP</div>
            <div className="col-span-3">Quests</div>
            {/* <div className="col-span-3">Badges</div> */}
          </div>

          {/* Rows */}
          <div>
            {leaderboardData.map((user, idx) => (
              <div
                key={user.rank}
                className={`p-6 border-b border-border grid grid-cols-12 gap-4 items-center hover:bg-secondary/5 transition-colors ${
                  idx < 3 ? "bg-primary/2" : ""
                }`}
              >
                {/* Rank */}
                <div className="col-span-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20 font-bold text-lg">
                    {idx === 0
                      ? "👑"
                      : idx === 1
                      ? "🥈"
                      : idx === 2
                      ? "🥉"
                      : user.rank}
                  </div>
                </div>

                {/* User Info */}
                <div className="col-span-5">
                  <div className="flex items-center gap-3">
                    {/* <span className="text-2xl">{user.avatar}</span> */}
                    {/* <div className="w-8 h-8 overflow-hidden">
                        <Image src={user.avatar} alt={user.username} width={32} height={32} />
                    </div> */}
                    <div>
                      <p className="font-semibold text-foreground">
                        {user.username}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {formatAddress(user.wallet)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* XP */}
                <div className="col-span-3">
                  <p className="font-bold text-primary text-lg">
                    {user.totalXP.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>

                {/* Quests Completed */}
                <div className="col-span-3">
                  <p className="font-bold text-foreground text-lg">
                    {user.questsCompleted}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>

                {/* Badges */}
                {/* <div className="col-span-3">
                  <div className="flex gap-1">
                    {Array(user.badges)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className="inline-block w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm"
                        >
                          {i + 1}
                        </span>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.badges} badges
                  </p>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
