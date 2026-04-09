/* eslint-disable react-hooks/set-state-in-effect */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import MuxPlayer from "@mux/mux-player-react"
import type MuxPlayerElement from "@mux/mux-player"
import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex-api"
import { LESSON_SEEK_EVENT, type LessonSeekEventDetail } from "@/lib/lesson-playback-events"

type PlaybackPolicy = "public" | "signed" | null

type PlaybackState =
  | { kind: "loading" }
  | { kind: "ready"; playbackToken: string | null }
  | { kind: "error"; message: string }

export function PrivateMuxPlayer({
  courseId,
  lessonId,
  playbackId,
  playbackPolicy,
  durationSeconds,
  nextLessonHref,
  posterUrl,
}: {
  courseId: string
  lessonId: string
  playbackId: string
  playbackPolicy: PlaybackPolicy
  durationSeconds: number | null
  nextLessonHref: string | null
  posterUrl?: string | null
}) {
  const router = useRouter()
  const getSignedPlaybackToken = useAction(api.videoPlayback.getSignedPlaybackToken)
  const recordLessonPlaybackHeartbeat = useMutation(api.progress.recordLessonPlaybackHeartbeat)
  const playbackPreferences = useQuery(api.progress.getUserPlaybackPreferences)
  const [state, setState] = useState<PlaybackState>(
    playbackPolicy === "signed" ? { kind: "loading" } : { kind: "ready", playbackToken: null },
  )
  const [localAutoplayEnabled] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem("courseLessonAutoplay") === "true"
  })
  const autoplayEnabled = playbackPreferences?.autoplayNextLesson ?? localAutoplayEnabled
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastHeartbeatSentAtRef = useRef(0)
  const muxPlayerRef = useRef<MuxPlayerElement | null>(null)

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdownRemaining(null)
  }, [])

  const sendHeartbeat = useCallback(
    (playheadSeconds: number, reportedDuration?: number | null) => {
      const duration = (reportedDuration ?? durationSeconds ?? playheadSeconds) > 0
        ? (reportedDuration ?? durationSeconds ?? playheadSeconds)
        : playheadSeconds

      void recordLessonPlaybackHeartbeat({
        courseId: courseId as never,
        lessonId: lessonId as never,
        playheadSeconds,
        durationSeconds: duration,
      })
    },
    [courseId, durationSeconds, lessonId, recordLessonPlaybackHeartbeat],
  )

  useEffect(() => {
    let cancelled = false

    if (playbackPolicy !== "signed") {
      setState({ kind: "ready", playbackToken: null })
      return
    }

    setState({ kind: "loading" })

    getSignedPlaybackToken({ lessonId: lessonId as never })
      .then((result) => {
        if (!cancelled) {
          setState({ kind: "ready", playbackToken: result.playbackToken })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            kind: "error",
            message: error instanceof Error ? error.message : "Unable to load this lesson video.",
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [getSignedPlaybackToken, lessonId, playbackPolicy])

  useEffect(() => {
    return () => {
      clearCountdown()
    }
  }, [clearCountdown])

  useEffect(() => {
    const onSeek = (event: Event) => {
      const customEvent = event as CustomEvent<LessonSeekEventDetail>
      const detail = customEvent.detail
      if (!detail || detail.lessonId !== lessonId) {
        return
      }

      const player = muxPlayerRef.current
      if (!player) {
        return
      }

      player.currentTime = Math.max(0, detail.seconds)
      void player.play()
    }

    window.addEventListener(LESSON_SEEK_EVENT, onSeek as EventListener)
    return () => {
      window.removeEventListener(LESSON_SEEK_EVENT, onSeek as EventListener)
    }
  }, [lessonId])

  if (state.kind === "loading") {
    return (
      <div className="flex aspect-video h-full w-full items-center justify-center bg-black px-6 text-center text-sm text-white/80">
        Preparing your private lesson video...
      </div>
    )
  }

  if (state.kind === "error") {
    return (
      <div className="flex aspect-video h-full w-full items-center justify-center bg-black px-6 text-center text-sm text-white/80">
        {state.message}
      </div>
    )
  }

  return (
    <div className="relative">
      <MuxPlayer
        ref={muxPlayerRef}
        playbackId={playbackId}
        tokens={state.playbackToken ? { playback: state.playbackToken } : undefined}
        poster={posterUrl ?? undefined}
        streamType="on-demand"
        accentColor="#1f2e46"
        className="mx-auto aspect-video h-full w-full lg:max-h-[75vh]"
        onTimeUpdate={(event: Event) => {
          const mediaElement = event.currentTarget as HTMLMediaElement | null
          if (!mediaElement) return
          const now = Date.now()
          if (now - lastHeartbeatSentAtRef.current < 15_000) return
          lastHeartbeatSentAtRef.current = now
          sendHeartbeat(mediaElement.currentTime, Number.isFinite(mediaElement.duration) ? mediaElement.duration : null)
        }}
        onPause={(event: Event) => {
          const mediaElement = event.currentTarget as HTMLMediaElement | null
          if (!mediaElement) return
          sendHeartbeat(mediaElement.currentTime, Number.isFinite(mediaElement.duration) ? mediaElement.duration : null)
        }}
        onEnded={(event: Event) => {
          const mediaElement = event.currentTarget as HTMLMediaElement | null
          if (mediaElement) {
            sendHeartbeat(mediaElement.currentTime, Number.isFinite(mediaElement.duration) ? mediaElement.duration : null)
          }

          if (!autoplayEnabled || !nextLessonHref) {
            clearCountdown()
            return
          }

          clearCountdown()
          setCountdownRemaining(5)
          countdownTimerRef.current = setInterval(() => {
            setCountdownRemaining((previous) => {
              if (previous === null) {
                return null
              }
              if (previous <= 1) {
                clearCountdown()
                router.push(nextLessonHref)
                return null
              }
              return previous - 1
            })
          }, 1000)
        }}
      />

      {countdownRemaining !== null ? (
        <div className="absolute right-4 bottom-4 rounded-lg bg-black/85 px-4 py-3 text-sm text-white">
          <p>Starting next lesson in {countdownRemaining}s</p>
          <button
            type="button"
            className="mt-2 rounded bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25"
            onClick={clearCountdown}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  )
}
