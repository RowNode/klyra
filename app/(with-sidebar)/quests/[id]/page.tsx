"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { transformQuest } from "@/lib/utils/quest-transform";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getProtocolByAddress, PROTOCOLS } from "@/lib/api-services/protocols";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { questManagerAbi, getQuestManagerAddress } from "@/lib/contracts-client";
import { toast } from "sonner";

export default function QuestDetailPage() {
  const params = useParams();
  const questId = params.id as string;
  const { address, isConnected } = useAccount();
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ accepted: boolean; completed: boolean } | null>(null);
  const [txHash, setTxHash] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  
  // Accept quest using wagmi
  const { writeContract: acceptQuest, data: acceptHash, isPending: isAccepting } = useWriteContract();
  const { isLoading: isConfirmingAccept, isSuccess: isAcceptSuccess } = useWaitForTransactionReceipt({
    hash: acceptHash,
  });

  // Fetch quest data
  useEffect(() => {
    async function fetchQuest() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/quests/${questId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Quest not found");
          }
          throw new Error("Failed to fetch quest");
        }

        const data = await response.json();
        setQuest(data.quest);
      } catch (err: any) {
        console.error("Error fetching quest:", err);
        setError(err.message || "Failed to load quest");
      } finally {
        setLoading(false);
      }
    }

    if (questId) {
      fetchQuest();
    }
  }, [questId]);

  // Fetch progress
  useEffect(() => {
    async function fetchProgress() {
      if (!questId || !address) return;
      
      try {
        const response = await fetch(`/api/quests/${questId}/progress/${address}`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress);
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    }

    if (questId && address) {
      fetchProgress();
    }
  }, [questId, address]);

  // Refetch progress after accept success
  useEffect(() => {
    if (isAcceptSuccess && address) {
      fetch(`/api/quests/${questId}/progress/${address}`)
        .then(res => res.json())
        .then(data => setProgress(data.progress))
        .catch(err => console.error("Error refetching progress:", err));
    }
  }, [isAcceptSuccess, questId, address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {error || "Quest not found"}
          </h1>
          <Link href="/quests">
            <Button className="mt-6">Back to Quests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const transformedQuest = transformQuest(quest);

  // Get protocol info
  const protocolAddress = quest.protocol_address?.toLowerCase();
  const protocol = protocolAddress ? getProtocolByAddress(protocolAddress) : PROTOCOLS.AGNI;
  
  // Format deadline
  const formatDeadline = () => {
    if (quest.expiry_timestamp) {
      const expiryDate = new Date(Number(quest.expiry_timestamp) * 1000);
      const now = new Date();
      const diffMs = expiryDate.getTime() - now.getTime();
      
      if (diffMs < 0) {
        return "Expired";
      }
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) {
        return `${diffHours}h`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d`;
      }
    }
    return transformedQuest.deadline || "No deadline";
  };

  const formattedDeadline = formatDeadline();

  // Handle accept quest
  const handleAcceptQuest = () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      acceptQuest({
        address: getQuestManagerAddress(),
        abi: questManagerAbi,
        functionName: "acceptQuest",
        args: [BigInt(questId)],
      });
      toast.info("Accepting quest...");
    } catch (err: any) {
      console.error("Error accepting quest:", err);
      toast.error(err.message || "Failed to accept quest");
    }
  };

  // Handle submit proof
  const handleSubmitProof = async () => {
    if (!txHash.trim()) {
      toast.error("Please enter transaction hash");
      return;
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash.trim())) {
      toast.error("Invalid transaction hash format");
      return;
    }

    setIsSubmittingProof(true);
    try {
      const response = await fetch(`/api/quests/${questId}/submit-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionHash: txHash.trim(),
          participant: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit proof");
      }

      toast.success("Proof submitted successfully! Quest completed.");
      setTxHash("");
      
      // Refetch progress
      if (address) {
        const progressResponse = await fetch(`/api/quests/${questId}/progress/${address}`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData.progress);
        }
      }
    } catch (err: any) {
      console.error("Error submitting proof:", err);
      toast.error(err.message || "Failed to submit proof");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Extended quest data
  const questData = {
    ...transformedQuest,
    goal: quest.description || transformedQuest.description,
    actionPlan: [
      "Connect your wallet to the platform",
      "Navigate to the protocol",
      "Complete the required action",
      "Verify transaction on-chain"
    ],
    successCriteria: [
      "Transaction must be completed on-chain",
      "Transaction must be verified on the blockchain",
      "Quest completion must be claimed within deadline"
    ],
    protocol: protocol?.name || "Agni DEX",
    metadataURI: quest.metadata_uri || quest.metadataURI || "",
    badgeLevel: quest.badge_level ? `Level ${quest.badge_level}` : "None",
    difficulty: transformedQuest.xp < 200 ? "Easy" : transformedQuest.xp < 500 ? "Medium" : "Hard",
    createdAt: quest.created_at || quest.createdAt || new Date().toISOString(),
    expiresAt: quest.expiry_timestamp 
      ? new Date(Number(quest.expiry_timestamp) * 1000).toISOString()
      : transformedQuest.deadline === "24h" 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    questImage: protocol?.logo || "/agni.avif",
    deadline: formattedDeadline,
    steps: [
      {
        step: 1,
        title: "Connect Wallet",
        description: "Ensure your wallet is connected to the Mantle network",
        completed: true
      },
      {
        step: 2,
        title: "Navigate to Protocol",
        description: "Visit the protocol platform",
        completed: true
      },
      {
        step: 3,
        title: "Complete Action",
        description: "Complete the required action",
        completed: transformedQuest.progress >= 75
      },
      {
        step: 4,
        title: "Verify Transaction",
        description: "Wait for transaction confirmation on-chain",
        completed: false
      }
    ]
  };

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/quests"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
      >
        ← Back to Quests
      </Link>

      {/* Main Card */}
      <div className="border border-border bg-card overflow-hidden shadow-lg">
        {/* Header with Gradient */}
        <div className="bg-linear-to-r from-primary/10 to-secondary/10 p-8 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-secondary/30 text-primary capitalize">
                  {questData.type}
                </span>
                {questData.badge && <span className="text-2xl">{questData.badge}</span>}
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                {questData.title}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary mb-1">
                {quest.xp} <span className="text-lg">XP</span>
              </p>
              <p className="text-lg text-muted-foreground">
                {quest.reward} Reward Points
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Quest Image */}
          {questData.questImage && (
            <div className="w-full max-w-2xl mx-auto aspect-video relative rounded-lg overflow-hidden border border-border bg-muted">
              <Image
                src={questData.questImage}
                alt={questData.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* About this Quest */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
              About this Quest
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Description
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {questData.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Goal
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {questData.goal}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Action Plan
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-base text-muted-foreground">
                  {questData.actionPlan.map((action, index) => (
                    <li key={index} className="leading-relaxed">
                      {action}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Success Criteria
                </h3>
                <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                  {questData.successCriteria.map((criterion, index) => (
                    <li key={index} className="leading-relaxed">
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quest Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
              Quest Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Quest ID
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.id}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Category
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.category}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Protocol
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.protocol}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Metadata URI
                </h3>
                <p className="text-sm font-semibold text-foreground break-all">
                  {questData.metadataURI}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Reward
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.reward} Points
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Badge Level
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.badgeLevel}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Quest Type
                </h3>
                <p className="text-base font-semibold text-foreground capitalize">
                  {questData.type}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Difficulty
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.difficulty}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Created At
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {new Date(questData.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Expires At
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {new Date(questData.expiresAt).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Participants
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.participants.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Status
                </h3>
                <p className="text-base font-semibold text-foreground capitalize">
                  {quest.status === "active"
                    ? "🟢 Active"
                    : quest.status === "completed"
                    ? "✓ Completed"
                    : "🔒 Locked"}
                </p>
              </div>

              <div className="p-4 bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Deadline
                </h3>
                <p className="text-base font-semibold text-foreground">
                  {questData.deadline}
                </p>
              </div>
            </div>
          </div>

          {/* Quest Steps */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
              Quest Steps
            </h2>
            
            <div className="space-y-4">
              {questData.steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${
                    step.completed
                      ? "bg-primary/5 border-primary/20"
                      : "bg-secondary/5 border-secondary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        step.completed
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {step.completed ? "✓" : step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-base text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          {questData.status === "active" && questData.progress > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Your Progress
                </h2>
                <span className="text-lg font-bold text-primary">
                  {questData.progress}%
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-3">
                <div
                  className="bg-linear-to-r from-primary to-secondary h-3 rounded-full transition-all"
                    style={{ width: `${questData.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Rewards Summary */}
          <div className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 p-6">
            <h3 className="font-semibold text-foreground mb-4">Rewards</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base Reward</span>
                <span className="font-semibold text-foreground">
                  {questData.reward} Points
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">XP Earned</span>
                <span className="font-semibold text-foreground">
                  {questData.xp} XP
                </span>
              </div>
              {questData.badge && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Special Badge</span>
                  <span className="font-semibold text-primary">
                    {questData.badge} Unlocked
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Section */}
          <div className="pt-6 border-t border-border space-y-4">
            {progress?.completed ? (
              <div className="text-center py-8">
                <p className="text-xl font-bold text-primary mb-2">
                  🎉 Quest Completed!
                </p>
                <p className="text-muted-foreground">
                  You earned {questData.xp} XP and {questData.reward} reward points
                </p>
              </div>
            ) : progress?.accepted ? (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-semibold text-primary mb-2">
                    ✓ Quest Accepted
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete the quest action and submit your transaction hash below.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">
                    Transaction Hash (from your swap)
                  </label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    onClick={handleSubmitProof}
                    disabled={isSubmittingProof || !txHash.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                  >
                    {isSubmittingProof ? "Submitting..." : "Submit Proof"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleAcceptQuest}
                disabled={quest.status === "locked" || isAccepting || isConfirmingAccept || !isConnected}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
              >
                {isAccepting || isConfirmingAccept
                  ? "Accepting..."
                  : quest.status === "locked"
                  ? "Quest Locked"
                  : !isConnected
                  ? "Connect Wallet"
                  : "Accept Quest"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
