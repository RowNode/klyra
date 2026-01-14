import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/api-services/supabase"
import { getUserRewardsFromChain } from "@/lib/services/rewardsService"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { message: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Get rewards from on-chain events (RewardReleased + BadgeMinted)
    const onChainRewards = await getUserRewardsFromChain(address)

    if (onChainRewards.length === 0) {
      return NextResponse.json({ rewards: [], totalKlyra: "0.00" })
    }

    // Get quest details from DB for context (title, etc)
    const questIds = onChainRewards.map((r: any) => r.questId)
    const { data: quests } = await supabase
      .from("quests")
      .select("quest_id_on_chain, title, badge_level, quest_type")
      .in("quest_id_on_chain", questIds)

    // Calculate total KLYRA earned
    let totalKlyra = 0
    for (const reward of onChainRewards) {
      if (reward.klyraAmount && reward.klyraAmount !== "0") {
        const amount = parseFloat(reward.klyraAmount)
        if (!isNaN(amount) && amount > 0) {
          totalKlyra += amount
        }
      }
    }
    const totalKlyraFormatted = totalKlyra.toFixed(2)

    // Combine on-chain rewards with quest metadata
    const rewards = onChainRewards.map((reward: any) => {
      const quest = quests?.find((q) => q.quest_id_on_chain === reward.questId)
      const klyraAmount = reward.klyraAmount ? parseFloat(reward.klyraAmount).toFixed(2) : "0"

      return {
        tokenId: reward.badgeTokenId,
        questId: reward.questId,
        questTitle: quest?.title || `Quest #${reward.questId}`,
        badgeLevel: reward.badgeLevel || quest?.badge_level || 1,
        questType: quest?.quest_type || "custom",
        rewardAmount: klyraAmount,
        badgeImageUri: reward.badgeImageUri,
        transactionHash: reward.transactionHash,
        earnedAt: reward.timestamp ? new Date(reward.timestamp * 1000).toISOString() : new Date().toISOString(),
      }
    })

    return NextResponse.json({
      rewards: rewards || [],
      totalKlyra: totalKlyraFormatted,
    })
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
