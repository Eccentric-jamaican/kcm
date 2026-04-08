"use client"

import { useEffect, useState } from "react"
import MuxPlayer from "@mux/mux-player-react"
import { useAction } from "convex/react"
import { api } from "@/lib/convex-api"

type PlaybackPolicy = "public" | "signed" | null

type PlaybackState =
  | { kind: "loading" }
  | { kind: "ready"; playbackToken: string | null }
  | { kind: "error"; message: string }

export function PrivateMuxPlayer({
  lessonId,
  playbackId,
  playbackPolicy,
  posterUrl,
}: {
  lessonId: string
  playbackId: string
  playbackPolicy: PlaybackPolicy
  posterUrl?: string | null
}) {
  const getSignedPlaybackToken = useAction(api.videoPlayback.getSignedPlaybackToken)
  const [state, setState] = useState<PlaybackState>(
    playbackPolicy === "signed" ? { kind: "loading" } : { kind: "ready", playbackToken: null },
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
    <MuxPlayer
      playbackId={playbackId}
      tokens={state.playbackToken ? { playback: state.playbackToken } : undefined}
      poster={posterUrl ?? undefined}
      streamType="on-demand"
      accentColor="#1f2e46"
      className="aspect-video h-full w-full"
    />
  )
}
