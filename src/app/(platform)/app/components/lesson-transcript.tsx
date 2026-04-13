"use client"

import { useEffect, useMemo, useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/lib/convex-api"
import type { TranscriptBlock } from "@/lib/course-body"
import { LESSON_SEEK_EVENT, type LessonSeekEventDetail } from "@/lib/lesson-playback-events"

type VttCue = {
  seconds: number
  timeLabel: string
  text: string
}

type TranscriptEntry = {
  seconds: number
  timeLabel: string
  text: string
}

function parseTimestampToSeconds(value: string): number {
  const normalized = value.replace(",", ".")
  const parts = normalized.split(":")
  if (parts.length === 2) {
    const minutes = Number(parts[0])
    const seconds = Number(parts[1])
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0
    return minutes * 60 + seconds
  }
  if (parts.length === 3) {
    const hours = Number(parts[0])
    const minutes = Number(parts[1])
    const seconds = Number(parts[2])
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0
    return hours * 3600 + minutes * 60 + seconds
  }
  return 0
}

function formatSeconds(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const remainder = total % 60
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
}

function parseVttToCues(vttText: string): VttCue[] {
  const normalized = vttText.replace(/\r/g, "")
  const chunks = normalized
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  const cues: VttCue[] = []

  for (const chunk of chunks) {
    if (chunk.startsWith("WEBVTT")) continue
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) continue

    const timeLineIndex = lines.findIndex((line) => line.includes("-->"))
    if (timeLineIndex === -1) continue

    const [startRaw] = lines[timeLineIndex].split("-->")
    const startText = startRaw.trim().split(" ")[0]
    const seconds = parseTimestampToSeconds(startText)
    const text = lines.slice(timeLineIndex + 1).join(" ").replace(/<[^>]+>/g, "").trim()
    if (!text) continue

    cues.push({
      seconds,
      timeLabel: formatSeconds(seconds),
      text,
    })
  }

  return cues
}

function normalizeCueText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase()
}

function dedupeConsecutiveCues(cues: VttCue[]): VttCue[] {
  const deduped: VttCue[] = []
  for (const cue of cues) {
    const previous = deduped[deduped.length - 1]
    if (!previous) {
      deduped.push(cue)
      continue
    }

    if (normalizeCueText(previous.text) === normalizeCueText(cue.text)) {
      continue
    }

    deduped.push(cue)
  }
  return deduped
}

function groupVttCuesForReading(cues: VttCue[]): TranscriptEntry[] {
  const sourceCues = dedupeConsecutiveCues(cues)
  if (sourceCues.length === 0) return []

  const grouped: TranscriptEntry[] = []
  let current: TranscriptEntry | null = null

  for (const cue of sourceCues) {
    if (!current) {
      current = { ...cue }
      continue
    }

    const timeGap = cue.seconds - current.seconds
    const canSplitByTime = timeGap >= 18
    const canSplitBySentence =
      /[.!?]$/.test(current.text.trim()) && current.text.length >= 55

    if (canSplitByTime || canSplitBySentence) {
      grouped.push(current)
      current = { ...cue }
      continue
    }

    current = {
      ...current,
      text: `${current.text} ${cue.text}`.trim(),
    }
  }

  if (current) {
    grouped.push(current)
  }

  return grouped
}

function emitSeek(lessonId: string, seconds: number) {
  window.dispatchEvent(
    new CustomEvent<LessonSeekEventDetail>(LESSON_SEEK_EVENT, {
      detail: {
        lessonId,
        seconds,
      },
    }),
  )
}

function jumpToPlayer() {
  const playerSection = document.getElementById("lesson-video-player")
  if (!playerSection) {
    return
  }
  playerSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

export function LessonTranscript({
  lessonId,
  transcriptStatus,
  transcriptTrackId,
  fallbackBlocks,
}: {
  lessonId: string
  transcriptStatus: "none" | "processing" | "ready" | "errored"
  transcriptTrackId?: string | null
  fallbackBlocks: TranscriptBlock[]
}) {
  const getSignedTranscriptVtt = useAction(api.videoPlayback.getSignedTranscriptVtt)
  const [vttText, setVttText] = useState<string | null>(null)

  useEffect(() => {
    if (transcriptStatus !== "ready" || !transcriptTrackId) {
      return
    }

    let cancelled = false

    getSignedTranscriptVtt({ lessonId: lessonId as never })
      .then((result) => {
        if (!cancelled) {
          setVttText(result.transcriptVtt)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVttText(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [getSignedTranscriptVtt, lessonId, transcriptStatus, transcriptTrackId])

  const vttCues = useMemo(() => (vttText ? parseVttToCues(vttText) : []), [vttText])
  const vttEntries = useMemo(() => groupVttCuesForReading(vttCues), [vttCues])
  const fallbackEntries = useMemo<TranscriptEntry[]>(
    () =>
      fallbackBlocks.flatMap((block) => {
        if (block.type !== "timestamp") return []
        return [
          {
            seconds: parseTimestampToSeconds(block.time),
            timeLabel: block.time,
            text: block.text,
          },
        ]
      }),
    [fallbackBlocks],
  )
  const entries = vttEntries.length > 0 ? vttEntries : fallbackEntries

  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <p key={`${entry.seconds}-${index}`} className="text-base leading-8 text-muted-foreground">
          <button
            type="button"
            className="mr-2 text-left text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground"
            onClick={() => {
              emitSeek(lessonId, entry.seconds)
              jumpToPlayer()
            }}
          >
            {entry.timeLabel}
          </button>
          {entry.text}
        </p>
      ))}

      {entries.length === 0
        ? fallbackBlocks
            .filter((block): block is { type: "paragraph"; text: string } => block.type === "paragraph")
            .map((block, index) => (
              <p key={index} className="text-base leading-8 text-muted-foreground">
                {block.text}
              </p>
            ))
        : null}
    </div>
  )
}
