"use client";

import { Button } from "@/components/ui/button";
import { Quest } from "@/lib/mock-data";
import { transformQuest } from "@/lib/utils/quest-transform";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function QuestsPage() {
  const { address } = useAccount();
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [allFilter, setAllFilter] = useState<"all" | "active" | "completed" | "failed">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuests() {
      try {
        setLoading(true);
        setError(null);
        const params = address ? `?participant=${address}` : "";
        const [activeRes, historyRes] = await Promise.all([
          fetch(`/api/quests${params}`),
          address
            ? fetch(`/api/quests/users/${address}/history`)
            : Promise.resolve(null),
        ]);

        if (!activeRes.ok) {
          throw new Error("Failed to fetch active quests");
        }

        const activeData = await activeRes.json();
        const transformedActive = (activeData.quests || []).map(transformQuest);
        setActiveQuests(transformedActive);

        if (historyRes && historyRes.ok) {
          const historyData = await historyRes.json();
          const transformedHistory = (historyData.quests || []).map(
            transformQuest
          );
          setCompletedQuests(transformedHistory);
        } else {
          setCompletedQuests([]);
        }
      } catch (err: any) {
        console.error("Error fetching quests:", err);
        setError(err.message || "Failed to load quests");
      } finally {
        setLoading(false);
      }
    }

    fetchQuests();
  }, [address]);

  // All quests (active + history) for the second section, de-duplicated by id
  const allQuests: Quest[] = (() => {
    const map = new Map<string | number, Quest>();

    // Prioritize history (completed/failed) version if it exists
    completedQuests.forEach((q) => {
      map.set(q.id, q);
    });

    // Add active quests only if not already in history
    activeQuests.forEach((q) => {
      if (!map.has(q.id)) {
        map.set(q.id, q);
      }
    });

    return Array.from(map.values());
  })();

  const filteredAllQuests = allQuests.filter((quest) => {
    const status = String(quest.status);

    if (allFilter === "active") {
      return status === "active";
    }
    if (allFilter === "completed") {
      return status === "completed";
    }
    if (allFilter === "failed") {
      // Treat expired / locked / cancelled as failed
      return (
        status === "locked" ||
        status === "expired" ||
        status === "cancelled"
      );
    }
    return true; // "all"
  });

  if (loading) {
    return (
      <div>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Available Quests
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete quests to earn rewards and XP
          </p>
        </div>
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">Loading quests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Available Quests
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete quests to earn rewards and XP
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

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Active Quests
        </h1>
        <p className="text-lg text-muted-foreground">
          These quests are currently live and can be completed for rewards.
        </p>
      </div>

      {/* Active quests */}
      <div className="flex flex-col gap-6 mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          Your Active Quests
        </h3>

        {/* Quests Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {activeQuests.length === 0 && (
            <div className="col-span-2 text-sm text-muted-foreground">
              You don't have any active quests right now. Check back later or wait
              for new daily/weekly quests.
            </div>
          )}

          {activeQuests.map((quest) => (
            <Link key={quest.id} href={`/quests/${quest.id}`}>
              <div className="group p-6 border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col rounded-none shadow-md">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-primary capitalize">
                        {quest.type}
                      </span>
                      {quest.badge && (
                        <span className="text-xl">{quest.badge}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {quest.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {quest.xp} XP
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quest.reward} REWARD
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {quest.description}
                </p>

                {/* Category Tag */}
                <div className="mb-4 flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {quest.category}
                  </span>
                </div>

                {/* Progress Bar */}
                {quest.status === "active" && (
                  <div className="mb-4">
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-linear-to-r from-primary to-secondary h-2 rounded-full transition-all"
                        style={{ width: `${quest.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quest.progress}% progress
                    </p>
                  </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {/* <span className="text-sm text-muted-foreground">
                    {quest.participants.toLocaleString()} participants
                  </span> */}
                  <span className="text-sm font-semibold">
                    {quest.status === "completed"
                      ? "✓ Completed"
                      : quest.status === "locked"
                      ? "🔒 Locked"
                      : quest.deadline || "Active"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All quests + filters */}
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          All Quests
        </h3>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={allFilter === "all" ? "default" : "outline"}
            onClick={() => setAllFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={allFilter === "active" ? "default" : "outline"}
            onClick={() => setAllFilter("active")}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={allFilter === "completed" ? "default" : "outline"}
            onClick={() => setAllFilter("completed")}
          >
            Completed
          </Button>
          <Button
            size="sm"
            variant={allFilter === "failed" ? "default" : "outline"}
            onClick={() => setAllFilter("failed")}
          >
            Failed
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredAllQuests.length === 0 && (
            <div className="col-span-2 text-sm text-muted-foreground">
              No quests found for this filter yet.
            </div>
          )}

          {filteredAllQuests.map((quest) => (
            <Link key={quest.id} href={`/quests/${quest.id}`}>
              <div className="group p-6 border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col rounded-none shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-primary capitalize">
                        {quest.type}
                      </span>
                      {quest.badge && (
                        <span className="text-xl">{quest.badge}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {quest.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {quest.xp} XP
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quest.reward} REWARD
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {quest.description}
                </p>

                <div className="mb-4 flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {quest.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-semibold">
                    {quest.status === "completed"
                      ? "✓ Completed"
                      : quest.status === "locked"
                      ? "Failed"
                      : quest.deadline || "Active"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
