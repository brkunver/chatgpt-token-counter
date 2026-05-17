import { describe, expect, it } from "vitest"
import { DEFAULT_UPDATE_INTERVAL, MAX_UPDATE_INTERVAL, MIN_UPDATE_INTERVAL } from "./constants"
import { normalizeCountMode, normalizeUpdateInterval } from "./settings-validation"

describe("normalizeUpdateInterval", () => {
  it("keeps valid intervals", () => {
    expect(normalizeUpdateInterval(500)).toBe(500)
    expect(normalizeUpdateInterval("750")).toBe(750)
  })

  it("falls back for invalid values", () => {
    expect(normalizeUpdateInterval(Number.NaN)).toBe(DEFAULT_UPDATE_INTERVAL)
    expect(normalizeUpdateInterval("not-a-number")).toBe(DEFAULT_UPDATE_INTERVAL)
  })

  it("clamps intervals to the supported range", () => {
    expect(normalizeUpdateInterval(-1)).toBe(MIN_UPDATE_INTERVAL)
    expect(normalizeUpdateInterval(MAX_UPDATE_INTERVAL + 1)).toBe(MAX_UPDATE_INTERVAL)
  })
})

describe("normalizeCountMode", () => {
  it("accepts characters and falls back to words", () => {
    expect(normalizeCountMode("characters")).toBe("characters")
    expect(normalizeCountMode("anything-else")).toBe("words")
  })
})
