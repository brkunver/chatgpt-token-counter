import { encode as gpt4oEncode } from "gpt-tokenizer/model/gpt-4o"

export function tokenCounter(text: string): number {
  return gpt4oEncode(text).length
}
