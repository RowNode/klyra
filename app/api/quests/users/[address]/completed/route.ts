import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/api-services/supabase"

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

    // Get quest submissions that are verified for this user
    const { data: submissions, error: submissionsError } = await supabase
      .from("quest_submissions")
      .select("quest_id_on_chain, verification_status, completion_tx_hash")
      .eq("participant_address", address.toLowerCase())
      .eq("verification_status", "verified")

    if (submissionsError) {
      throw new Error(`Failed to get quest submissions: ${submissionsError.message}`)
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ quests: [] })
    }

    // Get quest details for completed quests
    const questIds = submissions.map((s) => s.quest_id_on_chain)
    const { data: quests, error: questsError } = await supabase
      .from("quests")
      .select("*")
      .in("quest_id_on_chain", questIds)

    if (questsError) {
      throw new Error(`Failed to get quests: ${questsError.message}`)
    }

    // Match submissions with quests and add completion info
    const completedQuests = (quests || []).map((quest) => {
      const submission = submissions.find((s) => s.quest_id_on_chain === quest.quest_id_on_chain)
      return {
        ...quest,
        completionTxHash: submission?.completion_tx_hash,
        completedAt: submission?.completion_tx_hash ? new Date().toISOString() : undefined,
      }
    })

    return NextResponse.json({ quests: completedQuests || [] })
  } catch (error) {
    console.error("Error fetching completed quests:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
