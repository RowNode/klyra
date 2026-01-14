export interface Quest {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "featured"
  category: string
  reward: number
  xp: number
  participants: number
  status: "active" | "completed" | "locked"
  progress: number
  deadline?: string
  badge?: string
}

export interface LeaderboardUser {
  rank: number
  username: string
  wallet: string
  totalXP: number
  questsCompleted: number
  badges: number
  avatar: string
}

export interface UserProfile {
  username: string
  wallet: string
  totalXP: number
  level: number
  questsCompleted: number
  badges: number
  avatar: string
  joinDate: string
  stats: {
    dailyQuests: number
    weeklyQuests: number
    totalRewards: number
  }
}

export interface FAQ {
  id: string
  question: string
  answer: string
}

export const mockQuests: Quest[] = [
  {
    id: "1",
    title: "Swap 10 USDC",
    description: "Complete a token swap of at least 10 USDC on Agni DEX",
    type: "daily",
    category: "Trading",
    reward: 500,
    xp: 100,
    participants: 15200,
    status: "active",
    progress: 75,
    deadline: "24h",
  },
  {
    id: "2",
    title: "Provide Liquidity",
    description: "Provide liquidity to a pool on Agni DEX with a minimum value of $50",
    type: "daily",
    category: "Liquidity",
    reward: 750,
    xp: 150,
    participants: 8900,
    status: "active",
    progress: 30,
    deadline: "24h",
    badge: "💧",
  },
  {
    id: "3",
    title: "Weekly Trading Master",
    description: "Complete 5 trades totaling over $500 in value",
    type: "weekly",
    category: "Trading",
    reward: 2000,
    xp: 500,
    participants: 4500,
    status: "active",
    progress: 40,
    deadline: "7d",
  },
  {
    id: "4",
    title: "Community Contributor",
    description: "Post 3 meaningful comments on the forum or Discord",
    type: "weekly",
    category: "Community",
    reward: 1500,
    xp: 300,
    participants: 3200,
    status: "active",
    progress: 60,
    deadline: "7d",
  },
  {
    id: "5",
    title: "NFT Collector",
    description: "Purchase or mint an NFT on any supported marketplace",
    type: "weekly",
    category: "NFT",
    reward: 2500,
    xp: 600,
    participants: 2100,
    status: "active",
    progress: 0,
    deadline: "7d",
    badge: "🎨",
  },
  {
    id: "6",
    title: "Governance Voter",
    description: "Vote on a governance proposal",
    type: "daily",
    category: "Governance",
    reward: 300,
    xp: 75,
    participants: 5600,
    status: "active",
    progress: 0,
    deadline: "24h",
  },
  {
    id: "7",
    title: "Liquidity Provider",
    description: "Provide liquidity to any DEX pool with minimum $100",
    type: "weekly",
    category: "DeFi",
    reward: 3000,
    xp: 700,
    participants: 1800,
    status: "locked",
    progress: 0,
    deadline: "7d",
  },
  {
    id: "8",
    title: "Smart Staker",
    description: "Stake 1000+ tokens and hold for 7 days",
    type: "weekly",
    category: "Staking",
    reward: 2000,
    xp: 400,
    participants: 6200,
    status: "active",
    progress: 20,
    deadline: "7d",
    badge: "💎",
  },
]

export const mockLeaderboard: LeaderboardUser[] = [
  {
    rank: 1,
    username: "CryptoKing",
    wallet: "0x5a3B2cD4eF123A678bC96F12345678aBcD901234",
    totalXP: 45000,
    questsCompleted: 87,
    badges: 12,
    avatar: "https://github.com/shadcn.png",
  },
  {
    rank: 2,
    username: "DeFiMaster",
    wallet: "0x5a3B2cD4eF123A678bC96F12345678aBcD901234",
    totalXP: 42500,
    questsCompleted: 81,
    badges: 11,
    avatar: "https://github.com/shadcn.png",
  },
  {
    rank: 3,
    username: "QuestHunter",
    wallet: "0x5a3B2cD4eF123A678bC96F12345678aBcD901234",
    totalXP: 40200,
    questsCompleted: 76,
    badges: 10,
    avatar: "https://github.com/shadcn.png",
  },
  {
    rank: 4,
    username: "BlockChain",
    wallet: "0x5a3B2cD4eF123A678bC96F12345678aBcD901234",
    totalXP: 38900,
    questsCompleted: 73,
    badges: 9,
    avatar: "https://github.com/shadcn.png",
  },
  {
    rank: 5,
    username: "TokenSwapper",
    wallet: "0x5a3B2cD4eF123A678bC96F12345678aBcD901234",
    totalXP: 36500,
    questsCompleted: 68,
    badges: 8,
    avatar: "https://github.com/shadcn.png",
  },
]

export const mockUserProfile: UserProfile = {
  username: "YourUsername",
  wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f56Cc",
  totalXP: 8750,
  level: 12,
  questsCompleted: 32,
  badges: 5,
  avatar: "https://github.com/shadcn.png",
  joinDate: "2024-03-15",
  stats: {
    dailyQuests: 24,
    weeklyQuests: 8,
    totalRewards: 12500,
  },
}

export const mockFAQs: FAQ[] = [
  {
    id: "1",
    question: "What is DeFi Quest and how does it work?",
    answer:
      "DeFi Quest is a gamified platform where you complete on-chain tasks and challenges to earn rewards. Connect your wallet, browse available quests, complete them, and earn tokens and XP that help you climb the leaderboard.",
  },
  {
    id: "2",
    question: "How do I connect my wallet?",
    answer:
      "Click the 'Connect Wallet' button in the top right corner of the page. You can use MetaMask, WalletConnect, or any other supported wallet provider. Your wallet address will be linked to your profile.",
  },
  {
    id: "3",
    question: "What are the different types of quests?",
    answer:
      "We offer Daily Quests (reset every 24 hours), Weekly Quests (reset every 7 days), and Featured Quests (limited-time special challenges). Each type offers different rewards based on difficulty.",
  },
  {
    id: "4",
    question: "How are rewards calculated?",
    answer:
      "Rewards are based on quest difficulty, your participation tier, and market conditions. Each quest specifies the exact token reward and XP you'll earn upon completion. Rewards are distributed to your wallet immediately.",
  },
  {
    id: "5",
    question: "Can I participate in multiple quests at once?",
    answer:
      "Yes! You can work on multiple quests simultaneously. There's no limit to how many quests you can complete in a day, but each quest can only be claimed once per reset period.",
  },
  {
    id: "6",
    question: "How does the leaderboard ranking work?",
    answer:
      "The leaderboard ranks users by total XP earned. You can view rankings by all-time, monthly, or weekly periods. Your position updates in real-time as you complete quests and earn XP.",
  },
]
