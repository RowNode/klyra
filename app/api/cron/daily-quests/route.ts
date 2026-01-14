import { NextRequest, NextResponse } from "next/server"
import { generateDailyQuestsForAllUsers } from "@/lib/services/cronQuestService"

/**
 * POST /api/cron/daily-quests
 * Generate daily quests untuk semua active users
 * Dipanggil oleh Vercel Cron atau external cron service setiap hari jam 00:00 UTC
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
    const results = await generateDailyQuestsForAllUsers()
    return NextResponse.json({
      success: true,
      message: "Daily quests generation completed",
      results,
    })
  } catch (error: any) {
    console.error("Error generating daily quests:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate daily quests",
      },
      { status: 500 }
    )
  }
}

// Also support POST for external cron services
export async function POST(request: NextRequest) {
  return GET(request)
}
