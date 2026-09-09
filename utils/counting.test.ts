import { describe, expect, it, vi } from "vitest"
import { tokenCounter } from "@/utils/token-counter"
import { wordCounter } from "@/utils/word-counter"
import { characterCounter } from "@/utils/character-counter"
import { createConversationCounter } from "@/utils/conversation-counter"

describe("message counting", () => {
  it("counts special-token strings as ordinary text", () => {
    expect(tokenCounter("<|endoftext|> <|im_start|>")).toBeGreaterThan(2)
    expect(tokenCounter("")).toBe(0)
  })

  it("segments words without requiring spaces", () => {
    expect(wordCounter("Hello world!")).toBe(2)
    expect(wordCounter("你好世界")).toBeGreaterThan(1)
    expect(wordCounter("  !  ")).toBe(0)
  })

  it("counts combined emoji and accents as single characters", () => {
    expect(characterCounter("👨‍👩‍👧‍👦e\u0301")).toBe(2)
    expect(characterCounter("")).toBe(0)
  })

  it("reuses unchanged messages, counts duplicates, and evicts removed messages", () => {
    const count = vi.fn((text: string) => ({ tokens: text.length, words: 1, characters: text.length }))
    const counter = createConversationCounter(count)
    expect(counter(["a", "a", "bb"])).toEqual({ tokens: 4, words: 3, characters: 4 })
    expect(count).toHaveBeenCalledTimes(2)
    counter(["a", "bbc"])
    expect(count).toHaveBeenCalledTimes(3)
    expect(counter([])).toEqual({ tokens: 0, words: 0, characters: 0 })
    counter(["a"])
    expect(count).toHaveBeenCalledTimes(4)
  })

  it("retries a failed calculation on unchanged text", () => {
    const count = vi
      .fn(() => ({ tokens: 1, words: 1, characters: 1 }))
      .mockImplementationOnce(() => {
        throw new Error("temporary failure")
      })
    const counter = createConversationCounter(count)
    expect(() => counter(["a"])).toThrow("temporary failure")
    expect(counter(["a"]).tokens).toBe(1)
  })
})
