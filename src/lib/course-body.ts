export type TranscriptBlock =
  | { type: "timestamp"; time: string; text: string }
  | { type: "paragraph"; text: string }

const timestampPattern = /^(\d{2}:\d{2})(?:\s+|-+\s+)(.+)$/

export function parseCourseBody(body: string): TranscriptBlock[] {
  return body
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const match = segment.match(timestampPattern)
      if (match) {
        return {
          type: "timestamp" as const,
          time: match[1],
          text: match[2],
        }
      }

      return {
        type: "paragraph" as const,
        text: segment,
      }
    })
}
