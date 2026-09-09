const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

export function characterCounter(text: string): number {
  let count = 0
  for (const _segment of segmenter.segment(text)) count += 1
  return count
}
