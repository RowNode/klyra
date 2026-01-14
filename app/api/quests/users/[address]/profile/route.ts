import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/api-services/supabase"
import { saveProfile } from "@/lib/services/dbService"
import { generateInitialQuests } from "@/lib/services/dailyWeeklyQuestService"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const { name, email } = await request.json()

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { message: "Invalid wallet address" },
        { status: 400 }
      )
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    const user = await saveProfile(address, { name: name.trim(), email: email.trim() })

    // Get user with profile data (name, email, avatar_url) from DB
    const { data: userWithProfile } = await supabase
      .from("users")
      .select("id, wallet_address, name, email, avatar_url")
      .eq("wallet_address", address.toLowerCase())
      .single()

    // Generate initial daily and weekly quests after profile is saved
    // Don't wait for this - do it in background to avoid blocking response
    generateInitialQuests(address).catch((error) => {
      console.error("Failed to generate initial quests after profile save:", error)
      // Don't throw - quest generation failure shouldn't block profile save
    })

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully. Daily and weekly quests are being generated...",
      user: {
        user_id: user.id,
        wallet_address: user.wallet_address,
        name: userWithProfile?.name || undefined,
        email: userWithProfile?.email || undefined,
        avatar_url: userWithProfile?.avatar_url || undefined,
      },
    })
  } catch (error: any) {
    if (error.message?.includes("Invalid email") || error.message?.includes("Name is required")) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    console.error("Error saving profile:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
