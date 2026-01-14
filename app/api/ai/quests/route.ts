import { NextRequest, NextResponse } from "next/server"
import { generateQuestWithGroq } from "@/lib/services/aiQuestGenerator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await generateQuestWithGroq(body)
    return NextResponse.json(result, {
      status: result.onChainResult ? 201 : 200,
    })
  } catch (error) {
    console.error("Error generating quest:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
