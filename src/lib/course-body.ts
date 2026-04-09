export type TranscriptBlock =
  | { type: "timestamp"; time: string; text: string }
  | { type: "paragraph"; text: string }

const lineTimestampPattern = /^(\d{1,2}:\d{2})(?:\s+|-+\s+)(.+)$/
const inlineTimestampPattern =
  /(\d{1,2}:\d{2})(?:\s+\d+\s+(?:seconds|second|minutes|minute)(?:,\s*\d+\s+seconds?)?)?/g

function normalizeTimestamp(value: string) {
  const [minutes, seconds] = value.split(":")
  return `${minutes.padStart(2, "0")}:${seconds}`
}

function parseInlineTranscript(body: string): TranscriptBlock[] {
  const normalized = body.replace(/\s+/g, " ").trim()
  const matches = Array.from(normalized.matchAll(inlineTimestampPattern))

  if (matches.length < 2) {
    return []
  }

  const blocks: TranscriptBlock[] = []
  let previousEnd = 0

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index]
    const next = matches[index + 1]
    const start = current.index ?? 0
    const end = next?.index ?? normalized.length

    if (start > previousEnd) {
      const leading = normalized.slice(previousEnd, start).trim()
      if (leading) {
        blocks.push({ type: "paragraph", text: leading })
      }
    }

    const time = current[1]
    const text = normalized.slice(start + current[0].length, end).trim()

    if (text) {
      blocks.push({
        type: "timestamp",
        time: normalizeTimestamp(time),
        text,
      })
    }

    previousEnd = end
  }

  if (previousEnd < normalized.length) {
    const trailing = normalized.slice(previousEnd).trim()
    if (trailing) {
      blocks.push({ type: "paragraph", text: trailing })
    }
  }

  return blocks
}

export function parseCourseBody(body: string): TranscriptBlock[] {
  const inlineBlocks = parseInlineTranscript(body)
  if (inlineBlocks.length > 0) {
    return inlineBlocks
  }

  return body
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const match = segment.match(lineTimestampPattern)
      if (match) {
        return {
          type: "timestamp" as const,
          time: normalizeTimestamp(match[1]),
          text: match[2],
        }
      }

      return {
        type: "paragraph" as const,
        text: segment,
      }
    })
}
