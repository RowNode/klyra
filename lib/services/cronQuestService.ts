import { generateDailyQuest, generateWeeklyQuest, getUserActiveQuests } from "./dailyWeeklyQuestService"
import { supabase } from "@/lib/api-services/supabase"

/**
 * Helper function untuk get active users (yang sudah complete profile)
 */
async function getActiveUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("wallet_address")
    .not("name", "is", null)
    .not("email", "is", null)

  if (error) {
    throw new Error(`Failed to get active users: ${error.message}`)
  }

  return data || []
}

/**
 * Generate daily quests untuk semua active users
 * Dipanggil oleh cron job setiap hari jam 00:00 UTC
 */
export async function generateDailyQuestsForAllUsers() {
  console.log("[CRON] Running daily quest generation...", new Date().toISOString())
  const results = {
    totalUsers: 0,
    generated: 0,
    skipped: 0,
    errors: [] as Array<{ wallet: string; error: string }>,
  }

  try {
    const users = await getActiveUsers()
    results.totalUsers = users.length
    console.log(`[CRON] Found ${users.length} active users`)

    for (const user of users) {
      try {
        // Check if user already has active daily quest
        const existingQuests = await getUserActiveQuests(user.wallet_address)
        if (existingQuests.daily) {
          console.log(
            `[CRON] User ${user.wallet_address} already has active daily quest, skipping`
          )
          results.skipped++
          continue
        }

        await generateDailyQuest(user.wallet_address)
        console.log(`[CRON] ✓ Generated daily quest for ${user.wallet_address}`)
        results.generated++
      } catch (error: any) {
        console.error(`[CRON] ✗ Failed for ${user.wallet_address}:`, error.message)
        results.errors.push({
          wallet: user.wallet_address,
          error: error.message,
        })
      }
    }

    console.log("[CRON] Daily quest generation completed")
    return results
  } catch (error: any) {
    console.error("[CRON] Daily quest generation failed:", error.message)
    throw error
  }
}

/**
 * Generate weekly quests untuk semua active users
 * Dipanggil oleh cron job setiap Senin jam 00:00 UTC
 */
export async function generateWeeklyQuestsForAllUsers() {
  console.log("[CRON] Running weekly quest generation...", new Date().toISOString())
  const results = {
    totalUsers: 0,
    generated: 0,
    skipped: 0,
    errors: [] as Array<{ wallet: string; error: string }>,
  }

  try {
    const users = await getActiveUsers()
    results.totalUsers = users.length
    console.log(`[CRON] Found ${users.length} active users`)

    for (const user of users) {
      try {
        // Check if user already has active weekly quest
        const existingQuests = await getUserActiveQuests(user.wallet_address)
        if (existingQuests.weekly) {
          console.log(
            `[CRON] User ${user.wallet_address} already has active weekly quest, skipping`
          )
          results.skipped++
          continue
        }

        await generateWeeklyQuest(user.wallet_address)
        console.log(`[CRON] ✓ Generated weekly quest for ${user.wallet_address}`)
        results.generated++
      } catch (error: any) {
        console.error(`[CRON] ✗ Failed for ${user.wallet_address}:`, error.message)
        results.errors.push({
          wallet: user.wallet_address,
          error: error.message,
        })
      }
    }

    console.log("[CRON] Weekly quest generation completed")
    return results
  } catch (error: any) {
    console.error("[CRON] Weekly quest generation failed:", error.message)
    throw error
  }
}
