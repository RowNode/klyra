"use client";

import { transformQuest } from "@/lib/utils/quest-transform";
import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function ProfilePage() {
  const { address } = useAccount();
  const [profile, setProfile] = useState<any>(null);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user stats
        const statsResponse = await fetch(`/api/quests/users/${address}/stats`);
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch user stats");
        }
        const statsData = await statsResponse.json();

        // Check if user has profile data (name and email)
        if (!statsData.stats?.name || !statsData.stats?.email) {
          // User hasn't completed profile, redirect to complete-profile
          window.location.href = "/complete-profile";
          return;
        }

        setProfile(statsData.stats);

        // Fetch completed quests (non-blocking - if it fails, just show empty list)
        try {
          const completedResponse = await fetch(
            `/api/quests/users/${address}/completed`
          );
          if (completedResponse.ok) {
            const completedData = await completedResponse.json();
            const transformed = (completedData.quests || [])
              .slice(0, 4)
              .map(transformQuest);
            setCompletedQuests(transformed);
          }
        } catch (err) {
          console.warn("Failed to fetch completed quests:", err);
          // Don't set error, just show empty list
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err);
        // Don't set error if user just needs to complete profile
        if (err.message?.includes("profile")) {
          window.location.href = "/complete-profile";
          return;
        }
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [address]);

  const handleCopyAddress = () => {
    const walletAddress = address || profile?.wallet_address;
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile || !address) {
    return (
      <div>
        <div className="text-center py-20">
          <p className="text-lg text-destructive">
            {error || "Please connect your wallet"}
          </p>
        </div>
      </div>
    );
  }

  const walletAddress = address || profile.wallet_address;
  const username = profile.name || `User ${walletAddress.slice(0, 6)}`;
  const avatar = "https://github.com/shadcn.png";
  const email = profile.email || "No email provided";

  return (
    <div>
      {/* Profile Header */}
      <div className="p-8 border-2 border-primary bg-primary text-white mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24">
              <Image
                src={avatar}
                alt={username}
                width={96}
                height={96}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{username}</h1>

              <span className="text-sm text-white/70 font-mono">
                {email}
              </span>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-white/70 font-mono">
                  {walletAddress}
                </span>
                <div
                  onClick={handleCopyAddress}
                  className="cursor-pointer text-white/70"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </div>
              </div>

              {profile.updated_at && (
                <p className="text-sm text-white/70">
                  Updated {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/50 backdrop-blur border border-border p-6 rounded-none shadow-md">
          <h3 className="text-sm text-muted-foreground mb-2">Level</h3>
          <p className="text-4xl font-bold text-primary">
            {profile.level || 1}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-border p-6 rounded-none shadow-md">
          <h3 className="text-sm text-muted-foreground mb-2">Total XP</h3>
          <p className="text-4xl font-bold text-primary">
            {(profile.total_xp || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-border p-6 rounded-none shadow-md">
          <h3 className="text-sm text-muted-foreground mb-2">
            Quests Completed
          </h3>
          <p className="text-4xl font-bold text-primary">
            {profile.completed_quests || 0}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur border border-border p-6 rounded-none shadow-md">
          <h3 className="text-sm text-muted-foreground mb-2">
            Leaderboard Rank
          </h3>
          <p className="text-4xl font-bold text-primary">
            {profile.rank || "—"}
          </p>
        </div>
      </div>

      {/* Completed Quests */}
      <div className="bg-white/50 backdrop-blur border border-border p-6 rounded-none shadow-md">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Recent Completed Quests
        </h2>
        <div className="space-y-4">
          {completedQuests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed quests yet. Start completing quests to see them here!
            </p>
          ) : (
            completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-100 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{quest.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {quest.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{quest.xp} XP</p>
                  <p className="text-sm text-muted-foreground">
                    +{quest.reward} Points
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
