import { tokenCounter } from "@/utils/token-counter"
import { wordCounter } from "@/utils/word-counter"
import { characterCounter } from "@/utils/character-counter"

type Counts = { tokens: number; words: number; characters: number }

function countMessage(text: string): Counts {
  return { tokens: tokenCounter(text), words: wordCounter(text), characters: characterCounter(text) }
}

export function createConversationCounter(count = countMessage) {
  let cache = new Map<string, Counts>()

  return (messages: string[]) => {
    const nextCache = new Map<string, Counts>()
    const total = { tokens: 0, words: 0, characters: 0 }
    for (const text of messages) {
      const counts = nextCache.get(text) ?? cache.get(text) ?? count(text)
      nextCache.set(text, counts)
      total.tokens += counts.tokens
      total.words += counts.words
      total.characters += counts.characters
    }
    cache = nextCache
    return total
  }
}
