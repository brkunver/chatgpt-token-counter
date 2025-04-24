export function wordCounter(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
