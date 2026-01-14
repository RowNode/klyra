import { env } from "@/lib/config/env"

const PINATA_JSON_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
const PINATA_TIMEOUT = 60000 // 60 seconds (increased from 30s)
const MAX_RETRIES = 5 // Increased from 3
const RETRY_DELAY = 2000 // 2 seconds base delay (increased from 1s)

interface PinataResponse {
  IpfsHash: string
}

/**
 * Validate PINATA_JWT format
 */
function validatePinataJWT(jwt: string): boolean {
  // JWT format: header.payload.signature (3 parts separated by dots)
  const parts = jwt.split(".")
  return parts.length === 3 && jwt.length > 50
}

/**
 * Upload quest metadata to Pinata IPFS with retry logic and timeout
 * Will retry up to MAX_RETRIES times before throwing error
 */
export async function uploadQuestMetadata(
  metadata: unknown,
  name: string,
  retryCount = 0
): Promise<string> {
  // Validate PINATA_JWT before attempting upload
  if (!validatePinataJWT(env.PINATA_JWT)) {
    throw new Error(
      "Invalid PINATA_JWT format. Please check your environment variable. JWT should be in format: header.payload.signature"
    )
  }
  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PINATA_TIMEOUT)

    const response = await fetch(PINATA_JSON_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataMetadata: {
          name,
        },
        pinataContent: metadata,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      
      // Retry on 5xx errors or network issues
      if ((response.status >= 500 || response.status === 0) && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount) // Exponential backoff
        console.warn(
          `Pinata upload failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`,
          { status: response.status, error: errorText }
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        return uploadQuestMetadata(metadata, name, retryCount + 1)
      }

      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`)
    }

    const json = (await response.json()) as PinataResponse
    return `ipfs://${json.IpfsHash}`
  } catch (error: any) {
    // Handle timeout or network errors with retry
    if (
      (error.name === "AbortError" || error.code === "ETIMEDOUT" || error.message?.includes("timeout")) &&
      retryCount < MAX_RETRIES
    ) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount)
      console.warn(
        `Pinata upload timeout (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
      return uploadQuestMetadata(metadata, name, retryCount + 1)
    }

    // If all retries failed, throw error (no fallback)
    console.error("Pinata upload failed after all retries:", {
      error: error.message || error,
      code: error.code,
      name: error.name,
      retryCount,
      maxRetries: MAX_RETRIES,
      timeout: PINATA_TIMEOUT,
      endpoint: PINATA_JSON_ENDPOINT,
      jwtValid: validatePinataJWT(env.PINATA_JWT),
    })

    throw new Error(
      `Failed to upload to Pinata after ${MAX_RETRIES} attempts. ` +
      `Error: ${error.message || error}. ` +
      `Please check: 1) PINATA_JWT is valid and not expired, 2) Network connection, 3) Pinata API status (https://status.pinata.cloud)`
    )
  }
}

