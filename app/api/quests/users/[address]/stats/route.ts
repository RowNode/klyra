import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/api-services/supabase"
import { getOrCreateUser, getUserStats } from "@/lib/services/dbService"

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

    // Get or create user first
    await getOrCreateUser(address)

    const stats = await getUserStats(address)
    if (!stats) {
      // User created but no stats yet, return defaults with proper format
      // Also get user profile data (name, email) if exists
      const { data: user } = await supabase
        .from("users")
        .select("name, email")
        .eq("wallet_address", address.toLowerCase())
        .single()
      
      // For new user with 0 XP, rank is null (unranked)
      const rank = null

      return NextResponse.json({
        stats: {
          user_id: address, // Use wallet address as user_id for new users
          wallet_address: address,
          total_xp: 0,
          completed_quests: 0,
          level: 1,
          rank,
          updated_at: new Date().toISOString(),
          name: user?.name || undefined,
          email: user?.email || undefined,
        },
      })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
