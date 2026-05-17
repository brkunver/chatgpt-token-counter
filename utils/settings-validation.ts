import { DEFAULT_UPDATE_INTERVAL, MAX_UPDATE_INTERVAL, MIN_UPDATE_INTERVAL } from "./constants"

export type CountMode = "words" | "characters"

export function normalizeUpdateInterval(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(numericValue)) return DEFAULT_UPDATE_INTERVAL

  return Math.min(MAX_UPDATE_INTERVAL, Math.max(MIN_UPDATE_INTERVAL, Math.round(numericValue)))
}

export function normalizeCountMode(value: unknown): CountMode {
  return value === "characters" ? "characters" : "words"
}
