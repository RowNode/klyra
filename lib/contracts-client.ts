// Client-side contract configuration
// This file can be imported in client components without accessing server-side env vars

import QuestManagerArtifact from "../lib/abis/QuestManager.json"

export const questManagerAbi = QuestManagerArtifact.abi

// Get contract address from environment (should be NEXT_PUBLIC_* for client access)
export const getQuestManagerAddress = (): `0x${string}` => {
  const address = process.env.NEXT_PUBLIC_QUEST_MANAGER_ADDRESS
  if (!address) {
    throw new Error("NEXT_PUBLIC_QUEST_MANAGER_ADDRESS is not set")
  }
  return address as `0x${string}`
}
