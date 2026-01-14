/**
 * Quest Data Transformation Utilities
 * Transform backend quest format to frontend format
 */

import { Quest as MockQuest } from "@/lib/mock-data";

/**
 * Transform backend quest to frontend quest format
 */
export function transformQuest(backendQuest: any): MockQuest {
  // Calculate XP based on reward (rough estimate: 1 reward = 0.2 XP)
  const xp = backendQuest.reward_per_participant
    ? Math.floor(parseFloat(backendQuest.reward_per_participant) * 0.2)
    : 100;

  // Determine status
  let status: "active" | "completed" | "locked" = "active";
  if (backendQuest.status === "completed") {
    status = "completed";
  } else if (backendQuest.status === "cancelled" || backendQuest.status === "expired") {
    status = "locked";
  }

  // Determine type
  const questType = backendQuest.quest_type || "featured";
  const type: "daily" | "weekly" | "featured" =
    questType === "daily" ? "daily" : questType === "weekly" ? "weekly" : "featured";

  // Calculate deadline
  let deadline: string | undefined;
  if (backendQuest.expiry_timestamp) {
    const expiryDate = new Date(Number(backendQuest.expiry_timestamp) * 1000);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      deadline = `${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      deadline = `${diffDays}d`;
    }
  }

  // Get progress from progress object if available
  const progress = backendQuest.progress?.completed ? 100 : backendQuest.progress?.accepted ? 50 : 0;

  return {
    id: backendQuest.quest_id_on_chain?.toString() || backendQuest.id,
    title: backendQuest.title || "Untitled Quest",
    description: backendQuest.description || "",
    type,
    category: backendQuest.category || "DeFi",
    reward: backendQuest.reward_per_participant
      ? parseFloat(backendQuest.reward_per_participant)
      : 0,
    xp,
    participants: 0, // Not available in backend
    status,
    progress,
    deadline,
    badge: backendQuest.badge_level ? "🏅" : undefined,
  };
}

/**
 * Transform backend leaderboard user to frontend format
 */
export function transformLeaderboardUser(backendUser: any) {
  return {
    rank: backendUser.rank || 0,
    username: backendUser.name || `User ${backendUser.wallet_address?.slice(0, 6)}`,
    wallet: backendUser.wallet_address || "",
    totalXP: backendUser.total_xp || 0,
    questsCompleted: backendUser.completed_quests || 0,
    badges: backendUser.badge_level || 0,
    avatar: backendUser.avatar_url || "/placeholder-avatar.png",
  };
}
