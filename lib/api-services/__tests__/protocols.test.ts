import {
  getProtocolByAddress,
  getAllProtocols,
  getProtocolsByCategory,
  PROTOCOLS,
} from "../protocols"

describe("Protocols", () => {
  describe("getProtocolByAddress", () => {
    it("should return Agni DEX protocol by EVM address", () => {
      const protocol = getProtocolByAddress(
        "0xb5Dc27be0a565A4A80440f41c74137001920CB22"
      )
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("Agni DEX")
      expect(protocol?.category).toBe("swap")
    })

    it("should be case-insensitive", () => {
      const protocol = getProtocolByAddress(
        "0XB5DC27BE0A565A4A80440F41C74137001920CB22"
      )
      expect(protocol).not.toBeNull()
      expect(protocol?.name).toBe("Agni DEX")
    })

    it("should return null for invalid address", () => {
      const protocol = getProtocolByAddress("0xinvalid")
      expect(protocol).toBeNull()
    })
  })


  describe("getAllProtocols", () => {
    it("should return all protocols", () => {
      const protocols = getAllProtocols()
      expect(protocols.length).toBeGreaterThan(0)
      expect(protocols.length).toBe(Object.keys(PROTOCOLS).length)
    })

    it("should include all required fields", () => {
      const protocols = getAllProtocols()
      protocols.forEach((protocol) => {
        expect(protocol).toHaveProperty("name")
        expect(protocol).toHaveProperty("evmAddress")
        expect(protocol).toHaveProperty("category")
        expect(protocol).toHaveProperty("website")
        expect(protocol).toHaveProperty("description")
      })
    })
  })

  describe("getProtocolsByCategory", () => {
    it("should return only swap protocols", () => {
      const swapProtocols = getProtocolsByCategory("swap")
      expect(swapProtocols.length).toBeGreaterThan(0)
      swapProtocols.forEach((p) => {
        expect(p.category).toBe("swap")
      })
    })
  })
})

