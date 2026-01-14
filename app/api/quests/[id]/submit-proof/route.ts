import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { recordCompletion, getQuestById, getParticipantProgress } from "@/lib/services/questService"
import { verifyTransactionHash } from "@/lib/services/transactionVerificationService"
import {
  getExistingSubmission,
  saveQuestSubmission,
  updateSubmissionCompletion,
  updateSubmissionStatus,
  recordXP,
  getOrCreateUser,
  getQuestByOnChainId,
  type Quest,
} from "@/lib/services/dbService"

const submitProofSchema = z.object({
  transactionHash: z.string().min(1),
  participant: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
})

function calculateXpReward(quest?: Quest | null): number {
  if (!quest) {
    return 100
  }

  // Weekly quests (badge level >= 2) earn higher XP
  const badgeLevel = quest.badge_level ?? 0
  if (quest.quest_type === "weekly" || badgeLevel >= 2) {
    return 100
  }

  if (quest.quest_type === "daily" || badgeLevel === 1) {
    return 50
  }

  if (quest.reward_per_participant) {
    const reward = Number(quest.reward_per_participant)
    if (!Number.isNaN(reward)) {
      return Math.max(25, Math.round(reward / 2))
    }
  }

  return 75
}

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
    const parsed = submitProofSchema.parse(body)

    // Get quest details to verify participant
    const quest = await getQuestById(questId)
    if (quest.statusValue !== 1) {
      return NextResponse.json(
        {
          message: `Quest status is ${quest.status}. Only active quests can be completed.`,
        },
        { status: 400 }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const expiry = Number(quest.expiry ?? "0")
    if (expiry !== 0 && expiry < now) {
      return NextResponse.json(
        {
          message: "Quest has expired",
        },
        { status: 400 }
      )
    }

    // Verify participant matches (if provided in request)
    const participant = parsed.participant ?? quest.assignedParticipant
    if (participant.toLowerCase() !== quest.assignedParticipant.toLowerCase()) {
      return NextResponse.json(
        {
          message: "Participant address does not match quest assignment",
        },
        { status: 403 }
      )
    }

    const progress = await getParticipantProgress(questId, participant)
    if (!progress.accepted) {
      return NextResponse.json(
        {
          message: "Quest has not been accepted by this participant",
        },
        { status: 400 }
      )
    }
    if (progress.completed) {
      return NextResponse.json(
        {
          message: "Quest already marked as completed",
        },
        { status: 400 }
      )
    }

    // Check if tx hash already submitted (via DB)
    const existingSubmission = await getExistingSubmission(questId, parsed.transactionHash)
    
    // If already verified, return conflict
    if (existingSubmission && existingSubmission.verification_status === "verified") {
      return NextResponse.json(
        {
          message: "This transaction hash has already been verified for this quest",
        },
        { status: 409 }
      )
    }

    // Verify transaction hash via RPC
    const verification = await verifyTransactionHash(
      parsed.transactionHash,
      participant, // expected from address
      quest.protocol // expected to address (protocol address from quest)
    )

    if (!verification.valid) {
      // Update existing submission to failed, or create new one
      if (existingSubmission) {
        await updateSubmissionStatus(
          questId,
          parsed.transactionHash,
          "failed",
          verification.transaction
        )
      } else {
        await saveQuestSubmission({
          quest_id_on_chain: questId,
          participant_address: participant,
          transaction_hash: parsed.transactionHash,
          mirror_node_payload: verification.transaction,
          verification_status: "failed",
        })
      }

      return NextResponse.json(
        {
          message: "Transaction verification failed",
          error: verification.error,
        },
        { status: 400 }
      )
    }

    // Update existing submission to verified, or create new one
    if (existingSubmission) {
      await updateSubmissionStatus(
        questId,
        parsed.transactionHash,
        "verified",
        verification.transaction
      )
    } else {
      await saveQuestSubmission({
        quest_id_on_chain: questId,
        participant_address: participant,
        transaction_hash: parsed.transactionHash,
        mirror_node_payload: verification.transaction,
        verification_status: "verified",
      })
    }

    // Generate evidence URI (can be IPFS link to transaction proof later)
    const evidenceURI = `ipfs://proof_${questId}_${parsed.transactionHash.substring(0, 10)}`

    // Auto trigger recordCompletion
    const completionResult = await recordCompletion(questId, {
      participant,
      evidenceURI,
    })

    // Update submission with completion tx hash
    await updateSubmissionCompletion(questId, parsed.transactionHash, completionResult.transactionHash)

    // Get quest from DB to extract XP reward
    const dbQuest = await getQuestByOnChainId(questId)

    // Record XP gain (triggers user_stats update)
    if (dbQuest) {
      // Get or create user
      await getOrCreateUser(participant)

      const xpAmount = calculateXpReward(dbQuest)

      await recordXP(
        participant,
        questId,
        xpAmount,
        dbQuest.reward_per_participant,
        undefined, // badge_token_id will be available after NFT mint, can update later
        completionResult.transactionHash
      )
    }

    return NextResponse.json({
      message: "Quest completed successfully",
      questId: questId.toString(),
      transactionHash: completionResult.transactionHash,
      verification: {
        transactionHash: parsed.transactionHash,
        mirrorNodeTx: verification.transaction,
      },
    })
  } catch (error) {
    console.error("Error submitting proof:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
