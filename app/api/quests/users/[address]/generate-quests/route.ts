import { NextRequest, NextResponse } from "next/server"
import { getUserActiveQuests, generateInitialQuests } from "@/lib/services/dailyWeeklyQuestService"

export async function POST(
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

    // Check if user already has active daily/weekly quests
    const existingQuests = await getUserActiveQuests(address)
    const hasDaily = existingQuests.daily !== null
    const hasWeekly = existingQuests.weekly !== null

    // Only generate if user doesn't have active quests
    if (hasDaily && hasWeekly) {
      return NextResponse.json({
        success: true,
        message: "User already has active daily and weekly quests",
        quests: {
          daily: existingQuests.daily,
          weekly: existingQuests.weekly,
        },
      })
    }

    const results = await generateInitialQuests(address)

    return NextResponse.json({
      success: true,
      message: "Quests generated successfully",
      quests: {
        daily: results.daily || null,
        weekly: results.weekly || null,
      },
      errors: results.errors,
    })
  } catch (error) {
    console.error("Error generating quests:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
