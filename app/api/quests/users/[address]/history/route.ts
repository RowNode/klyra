import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/api-services/supabase"
import { getParticipantProgress } from "@/lib/services/questService"

/**
 * GET /api/quests/users/[address]/history
 * Get all quest history for a user (completed, expired, cancelled)
 */
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

    const normalizedAddress = address.toLowerCase()
    const now = Math.floor(Date.now() / 1000)

    // Get all quests assigned to this user (any status)
    const { data: allQuests, error: questsError } = await supabase
      .from("quests")
      .select("*")
      .eq("assigned_participant", normalizedAddress)
      .order("created_at", { ascending: false })
      .limit(200) // Limit to prevent too many results

    if (questsError) {
      throw new Error(`Failed to get quests: ${questsError.message}`)
    }

    if (!allQuests || allQuests.length === 0) {
      return NextResponse.json({ quests: [] })
    }

    // Get verified submissions to check which quests are completed
    const { data: submissions } = await supabase
      .from("quest_submissions")
      .select("quest_id_on_chain, verification_status, completion_tx_hash, created_at")
      .eq("participant_address", normalizedAddress)
      .eq("verification_status", "verified")

    const completedQuestIds = new Set(
      (submissions || []).map((s) => s.quest_id_on_chain)
    )

    // Categorize quests and add progress info
    const historyQuests = await Promise.all(
      allQuests.map(async (quest: any) => {
        const questId = quest.quest_id_on_chain
        const isCompleted = completedQuestIds.has(questId)
        
        // Check if expired (expiry timestamp exists and is in the past, and not completed)
        const expiry = quest.expiry_timestamp ? Number(quest.expiry_timestamp) : 0
        const isExpired = expiry > 0 && expiry < now && !isCompleted

        // Determine status
        let status = quest.status
        if (isCompleted) {
          status = "completed"
        } else if (isExpired) {
          status = "expired"
        } else if (quest.status === "cancelled") {
          status = "cancelled"
        }

        // Get progress from on-chain
        let progress = { accepted: false, completed: false }
        try {
          progress = await getParticipantProgress(questId, normalizedAddress)
        } catch (err) {
          // If progress fetch fails, use defaults
          console.warn(`Failed to get progress for quest ${questId}:`, err)
        }

        // Find submission for completion info
        const submission = submissions?.find(
          (s) => s.quest_id_on_chain === questId
        )

        return {
          ...quest,
          status,
          progress: {
            accepted: progress.accepted,
            completed: progress.completed || isCompleted,
          },
          completionTxHash: submission?.completion_tx_hash,
          completedAt: submission?.created_at,
        }
      })
    )

    // Filter: only return quests that are NOT active (completed, expired, or cancelled)
    // OR quests that are active but expired
    const filteredHistory = historyQuests.filter((quest) => {
      return (
        quest.status === "completed" ||
        quest.status === "expired" ||
        quest.status === "cancelled" ||
        (quest.status === "active" && 
         quest.expiry_timestamp && 
         Number(quest.expiry_timestamp) < now)
      )
    })

    return NextResponse.json({ quests: filteredHistory })
  } catch (error) {
    console.error("Error fetching quest history:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
