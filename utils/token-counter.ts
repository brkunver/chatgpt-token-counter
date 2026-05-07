import { encode as gpt5Encode } from "gpt-tokenizer/model/gpt-5"

export function tokenCounter(text: string): number {
  return gpt5Encode(text).length
}
