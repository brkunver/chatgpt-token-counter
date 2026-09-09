const segmenter = new Intl.Segmenter(undefined, { granularity: "word" })

export function wordCounter(text: string): number {
  let count = 0
  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike) count += 1
  }
  return count
}
