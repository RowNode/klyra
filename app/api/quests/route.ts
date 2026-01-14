import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/api-services/supabase"
import { getParticipantProgress } from "@/lib/services/questService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const participant = searchParams.get("participant") || undefined
    
    let query = supabase
      .from("quests")
      .select("*")
      .eq("status", "active")
    
    // Filter by participant if provided
    if (participant && /^0x[a-fA-F0-9]{40}$/.test(participant)) {
      query = query.eq("assigned_participant", participant.toLowerCase())
    }
    
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      throw new Error(`Failed to get quests: ${error.message}`)
    }

    // If participant is provided, fetch progress for each quest
    const questsWithProgress = data || []
    if (participant && /^0x[a-fA-F0-9]{40}$/.test(participant)) {
      const progressPromises = questsWithProgress.map(async (quest: any) => {
        try {
          const progress = await getParticipantProgress(
            Number(quest.quest_id_on_chain),
            participant
          )
          return {
            ...quest,
            progress: {
              accepted: progress.accepted || false,
              completed: progress.completed || false,
            },
          }
        } catch (err) {
          // If progress fetch fails, return quest without progress
          return {
            ...quest,
            progress: {
              accepted: false,
              completed: false,
            },
          }
        }
      })
      
      const quests = await Promise.all(progressPromises)
      return NextResponse.json({ quests })
    }

    return NextResponse.json({ quests: questsWithProgress })
  } catch (error) {
    console.error("Error fetching quests:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
