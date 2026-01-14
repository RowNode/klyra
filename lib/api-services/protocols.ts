export interface Protocol {
  name: string
  evmAddress: string // EVM-compatible address (0x...)
  category: "swap" | "liquidity" | "stake" | "lend"
  website: string
  description: string
  logo?: string // Protocol logo URL or IPFS path
  swapTokens?: Array<{ symbol: string; address: string }> // Available tokens for swap
}

export const PROTOCOLS: Record<string, Protocol> = {
  AGNI: {
    name: "Agni DEX",
    evmAddress: "0xb5Dc27be0a565A4A80440f41c74137001920CB22",
    category: "swap",
    website: "https://agniswap.fi/",
    description: "Decentralized exchange (DEX) for token swaps on Mantle Sepolia",
    logo: "/agni.avif",
    swapTokens: [
      { symbol: "USDC", address: "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080" },
      { symbol: "USDT", address: "0xcC4Ac915857532ADa58D69493554C6d869932Fe6" },
      { symbol: "DOGE", address: "0x3eDb12e9CF43A6f645EEDEE2800E01E142C5758D" },
      { symbol: "WMNT", address: "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF" },
      { symbol: "MAMA", address: "0xF6762aFB45ac0aF7ddC5aA92B885c6ECe57874dc" },
    ],
  },
}

/**
 * Get protocol by EVM address (case-insensitive)
 */
export function getProtocolByAddress(address: string): Protocol | null {
  const normalized = address.toLowerCase()
  return (
    Object.values(PROTOCOLS).find(
      (p) => p.evmAddress.toLowerCase() === normalized
    ) || null
  )
}


/**
 * Get all protocols
 */
export function getAllProtocols(): Protocol[] {
  return Object.values(PROTOCOLS)
}

/**
 * Get protocols by category
 */
export function getProtocolsByCategory(
  category: Protocol["category"]
): Protocol[] {
  return Object.values(PROTOCOLS).filter((p) => p.category === category)
}

