import { NextRequest, NextResponse } from "next/server"
import { generateWeeklyQuestsForAllUsers } from "@/lib/services/cronQuestService"

/**
 * POST /api/cron/weekly-quests
 * Generate weekly quests untuk semua active users
 * Dipanggil oleh Vercel Cron atau external cron service setiap Senin jam 00:00 UTC
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security (Vercel automatically adds this header)
  // For external cron services, use Authorization header
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // If CRON_SECRET is set, verify it
  if (cronSecret) {
    // Vercel cron sends authorization header automatically
    // External cron services should send: Authorization: Bearer <CRON_SECRET>
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const results = await generateWeeklyQuestsForAllUsers()
    return NextResponse.json({
      success: true,
      message: "Weekly quests generation completed",
      results,
    })
  } catch (error: any) {
    console.error("Error generating weekly quests:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate weekly quests",
      },
      { status: 500 }
    )
  }
}

// Also support POST for external cron services
export async function POST(request: NextRequest) {
  return GET(request)
}
