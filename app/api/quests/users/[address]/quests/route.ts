import { NextRequest, NextResponse } from "next/server"
import { getUserActiveQuests } from "@/lib/services/dailyWeeklyQuestService"

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

    const quests = await getUserActiveQuests(address)

    return NextResponse.json({
      quests: {
        daily: quests.daily,
        weekly: quests.weekly,
        all: quests.all,
      },
    })
  } catch (error) {
    console.error("Error fetching user quests:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
