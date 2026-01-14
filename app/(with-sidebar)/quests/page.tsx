"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Quest } from "@/lib/mock-data";
import { transformQuest } from "@/lib/utils/quest-transform";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Search, X } from "lucide-react";

export default function QuestsPage() {
  const { address } = useAccount();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const types = ["all", "Completed", "In Progress", "Not Started", "Expired"];
  const categories = [
    "all",
    "Trading",
    "Lending",
    "Community",
    "NFT",
    "Governance",
    "DeFi",
    "Staking",
  ];

  useEffect(() => {
    async function fetchQuests() {
      try {
        setLoading(true);
        setError(null);
        const params = address ? `?participant=${address}` : "";
        const response = await fetch(`/api/quests${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quests");
        }

        const data = await response.json();
        const transformedQuests = (data.quests || []).map(transformQuest);
        console.log("transformedQuests", transformedQuests);
        setQuests(transformedQuests);
      } catch (err: any) {
        console.error("Error fetching quests:", err);
        setError(err.message || "Failed to load quests");
      } finally {
        setLoading(false);
      }
    }

    fetchQuests();
  }, [address]);

  const filteredQuests = quests.filter((quest) => {
    const typeMatch =
      selectedType === "all" ||
      (selectedType === "Completed" && quest.status === "completed") ||
      (selectedType === "In Progress" &&
        quest.status === "active" &&
        quest.progress > 0 &&
        quest.progress < 100) ||
      (selectedType === "Not Started" &&
        quest.status === "active" &&
        quest.progress === 0) ||
      (selectedType === "Expired" && quest.status === "locked");
    const categoryMatch =
      selectedCategory === "all" || quest.category === selectedCategory;

    // Search filter - matches title, description, or category
    const searchMatch =
      searchQuery === "" ||
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.category.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && categoryMatch && searchMatch;
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
          Available Quests
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete quests to earn rewards and XP
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          Your Quests
        </h3>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background w-[300px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quests Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredQuests.map((quest) => (
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

      {filteredQuests.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? `No quests found matching "${searchQuery}".`
              : "No quests found for your filters."}
          </p>
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* <div className="flex flex-col gap-6">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
          My Quests
        </h3>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search quests by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Quest Conditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  variant={selectedType === type ? "default" : "outline"}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredQuests.map((quest) => (
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

                <div className="flex items-center justify-between pt-4 border-t border-border">
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

      {filteredQuests.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">
            {searchQuery
              ? `No quests found matching "${searchQuery}".`
              : "No quests found for your filters."}
          </p>
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )} */}
    </div>
  );
}
