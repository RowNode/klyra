import { NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/services/dbService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 100
    const leaderboard = await getLeaderboard(limit)
    return NextResponse.json({
      leaderboard: leaderboard.map((entry) => ({
        user_id: entry.user_id,
        wallet_address: entry.wallet_address,
        total_xp: entry.total_xp,
        completed_quests: entry.completed_quests,
        level: entry.level,
        rank: entry.rank,
        updated_at: entry.updated_at,
        name: entry.name,
        email: entry.email,
        avatar_url: entry.avatar_url,
      })),
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
