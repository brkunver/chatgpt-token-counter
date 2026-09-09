import { encode as gpt5Encode } from "gpt-tokenizer/model/gpt-5"

const options = { disallowedSpecial: new Set<string>() }

export function tokenCounter(text: string): number {
  return gpt5Encode(text, options).length
}
