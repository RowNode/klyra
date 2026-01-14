import { NextRequest, NextResponse } from "next/server"
import { getQuestByOnChainId } from "@/lib/services/dbService"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questId = Number(id)
    if (Number.isNaN(questId) || questId <= 0) {
      return NextResponse.json(
        { message: "Invalid quest id" },
        { status: 400 }
      )
    }
    const quest = await getQuestByOnChainId(questId)
    if (!quest) {
      return NextResponse.json(
        { message: "Quest not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ quest })
  } catch (error) {
    console.error("Error fetching quest:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
