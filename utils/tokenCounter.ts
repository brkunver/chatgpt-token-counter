import { encoding_for_model, TiktokenModel } from "tiktoken"

export function tokenCounter(text: string, model: TiktokenModel = "chatgpt-4o-latest"): number {
  const encoding = encoding_for_model(model)
  const tokens = encoding.encode(text)
  return tokens.length
}
