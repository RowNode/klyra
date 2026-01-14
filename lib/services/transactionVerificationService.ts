import { publicClient } from "@/lib/api-services/contracts"
import { getAddress } from "viem"

interface VerifiedTransaction {
  transaction_id: string
  status: string
  name: string
  entity_id?: string
  memo_base64?: string
  transaction_hash: string
  charged_tx_fee: number
  max_fee: string
  valid_start_timestamp: string
  transfers?: Array<{
    account: string
    amount: number
    is_approval?: boolean
  }>
  token_transfers?: Array<{
    token_id: string
    account: string
    amount: number
    decimals: number
  }>
  nft_transfers?: Array<{
    token_id: string
    sender_account_id?: string
    receiver_account_id?: string
    serial_number: number
  }>
}

/**
 * Verify EVM transaction hash via RPC (Mantle Sepolia)
 * Query transaction receipt directly from blockchain using Viem
 */
export async function verifyTransactionHash(
  txHash: string,
  expectedFrom?: string,
  expectedTo?: string
): Promise<{ valid: boolean; transaction?: VerifiedTransaction; error?: string }> {
  try {
    // Validate tx hash format
    if (!txHash.startsWith("0x") || txHash.length !== 66) {
      return {
        valid: false,
        error: "Invalid transaction hash format. Expected 0x followed by 64 hex characters.",
      }
    }

    // Normalize addresses for comparison
    const normalizedFrom = expectedFrom ? getAddress(expectedFrom) : null
    const normalizedTo = expectedTo ? getAddress(expectedTo) : null

    // Query transaction receipt via RPC
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    // Verify transaction status
    if (receipt.status === "reverted") {
      return {
        valid: false,
        error: "Transaction was reverted",
      }
    }

    // Verify from address (transaction.from)
    if (normalizedFrom) {
      const txFrom = getAddress(receipt.from)
      if (txFrom.toLowerCase() !== normalizedFrom.toLowerCase()) {
        return {
          valid: false,
          error: `Transaction from address mismatch. Expected: ${expectedFrom}, Got: ${receipt.from}`,
        }
      }
    }

    // Verify to address (transaction.to or contract address in logs)
    if (normalizedTo) {
      // Check if transaction.to matches
      if (receipt.to && getAddress(receipt.to).toLowerCase() === normalizedTo.toLowerCase()) {
        // Direct contract call, to address matches
      } else {
        // Check logs for contract interactions (e.g., swap events)
        // For DEX swaps, the protocol address might be in logs
        const hasProtocolInLogs = receipt.logs.some((log) => {
          try {
            const logAddress = getAddress(log.address)
            return logAddress.toLowerCase() === normalizedTo.toLowerCase()
          } catch {
            return false
          }
        })

        if (!hasProtocolInLogs) {
          // If to address doesn't match and not in logs, verify if it's a contract creation
          // For now, we'll be lenient - if to address is provided but doesn't match exactly,
          // we check logs. If still no match, we return error.
          // This allows for cases where user interacts with a router that then calls the protocol
          return {
            valid: false,
            error: `Transaction to address mismatch. Expected: ${expectedTo}, Got: ${receipt.to || "contract creation"}`,
          }
        }
      }
    }

    // Convert receipt to VerifiedTransaction format for compatibility
    const transaction: VerifiedTransaction = {
      transaction_id: txHash,
      transaction_hash: txHash,
      status: receipt.status === "success" ? "SUCCESS" : "FAILED",
      name: receipt.to ? "CONTRACTCALL" : "CONTRACTCREATE",
      entity_id: receipt.to || undefined,
      valid_start_timestamp: receipt.blockNumber.toString(),
      charged_tx_fee: Number(receipt.gasUsed) * Number(receipt.effectiveGasPrice || 0),
      max_fee: receipt.gasUsed.toString(),
    }

    return {
      valid: true,
      transaction,
    }
  } catch (error) {
    console.error("Error verifying transaction via RPC:", error)
    
    // Check if transaction not found
    if (error instanceof Error && error.message.includes("not found")) {
      return {
        valid: false,
        error: "Transaction not found on blockchain",
      }
    }

    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error verifying transaction",
    }
  }
}
