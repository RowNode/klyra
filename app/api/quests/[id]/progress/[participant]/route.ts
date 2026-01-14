import { NextRequest, NextResponse } from "next/server"
import { getParticipantProgress } from "@/lib/services/questService"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participant: string }> }
) {
  try {
    const { id, participant } = await params
    const questId = Number(id)

    if (Number.isNaN(questId) || questId <= 0) {
      return NextResponse.json(
        { message: "Invalid quest id" },
        { status: 400 }
      )
    }
    if (!participant || !/^0x[a-fA-F0-9]{40}$/.test(participant)) {
      return NextResponse.json(
        { message: "Invalid participant address" },
        { status: 400 }
      )
    }

    const progress = await getParticipantProgress(questId, participant)
    return NextResponse.json({ questId, participant, progress })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
