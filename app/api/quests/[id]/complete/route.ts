import { NextRequest, NextResponse } from "next/server"
import { recordCompletion } from "@/lib/services/questService"

export async function POST(
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
    const body = await request.json()
    const result = await recordCompletion(questId, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error completing quest:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
