"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { throwAppError } from "./lib/errors";

type MuxDirectUploadResponse = {
  data?: {
    id?: string;
    url?: string;
  };
};

type MuxAssetResponse = {
  data?: {
    id?: string;
    status?: string;
    duration?: number;
    playback_ids?: Array<{ id: string }>;
    tracks?: Array<{
      id?: string;
      type?: string;
      text_source?: string;
      status?: string;
    }>;
  };
};

function getMuxAuthHeader() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    throwAppError(
      "mux_unavailable",
      "Video uploads are temporarily unavailable. Please try again later.",
      { retryable: true },
    );
  }

  return `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
}

export const createMuxDirectUpload = action({
  args: {
    lessonId: v.id("courseLessons"),
    corsOrigin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lessonEditor = await ctx.runQuery(api.admin.getLessonEditor, {
      lessonId: args.lessonId,
    });

    if (!lessonEditor) {
      throwAppError("lesson_not_found", "This lesson could not be found.");
    }

    const response = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: getMuxAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cors_origin: args.corsOrigin,
        new_asset_settings: {
          playback_policy: ["signed"],
          inputs: [
            {
              generated_subtitles: [
                {
                  language_code: "en",
                  name: "English CC",
                },
              ],
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      console.error("Mux upload creation failed", {
        lessonId: args.lessonId,
        status: response.status,
      });
      throwAppError(
        "mux_upload_failed",
        "Unable to start the video upload right now. Please try again.",
        { retryable: true },
      );
    }

    const payload = (await response.json()) as MuxDirectUploadResponse;
    if (!payload.data?.id || !payload.data?.url) {
      console.error("Mux upload creation returned an incomplete payload", {
        lessonId: args.lessonId,
        payload,
      });
      throwAppError(
        "mux_upload_failed",
        "Mux did not return a valid upload session. Please try again.",
        { retryable: true },
      );
    }

    await ctx.runMutation(api.admin.attachMuxUploadToLesson, {
      lessonId: args.lessonId,
      muxUploadId: payload.data.id,
      playbackPolicy: "signed",
      status: "uploading",
    });

    return {
      uploadId: payload.data.id,
      uploadUrl: payload.data.url,
    };
  },
});

export const refreshMuxAsset = action({
  args: {
    lessonId: v.id("courseLessons"),
  },
  handler: async (ctx, args) => {
    const lessonEditor = await ctx.runQuery(api.admin.getLessonEditor, {
      lessonId: args.lessonId,
    });

    if (!lessonEditor?.lesson.muxAssetId) {
      throwAppError("mux_asset_missing", "This lesson doesn't have a video asset yet.");
    }

    const response = await fetch(`https://api.mux.com/video/v1/assets/${lessonEditor.lesson.muxAssetId}`, {
      headers: {
        Authorization: getMuxAuthHeader(),
      },
    });

    if (!response.ok) {
      console.error("Mux asset refresh failed", {
        lessonId: args.lessonId,
        muxAssetId: lessonEditor.lesson.muxAssetId,
        status: response.status,
      });
      throwAppError(
        "mux_refresh_failed",
        "Unable to refresh the video status right now. Please try again.",
        { retryable: true },
      );
    }

    const payload = (await response.json()) as MuxAssetResponse;
    const status = payload.data?.status;
    const playbackId = payload.data?.playback_ids?.[0]?.id ?? null;
    const generatedTrack = payload.data?.tracks?.find(
      (track) => track.type === "text" && track.text_source === "generated_vod",
    );
    const generatedTrackStatus = generatedTrack?.status;
    const mappedStatus =
      status === "ready" ? "ready" : status === "errored" ? "errored" : "processing";
    const transcriptStatus =
      generatedTrackStatus === "ready"
        ? "ready"
        : generatedTrackStatus === "errored"
          ? "errored"
          : mappedStatus === "errored"
            ? "errored"
            : generatedTrack
              ? "processing"
              : "none";

    await ctx.runMutation(internal.admin.updateMuxLessonStatus, {
      lessonId: args.lessonId,
      muxAssetId: payload.data?.id ?? lessonEditor.lesson.muxAssetId,
      muxPlaybackId: playbackId,
      muxStatus: mappedStatus,
      durationSeconds: payload.data?.duration ? Math.round(payload.data.duration) : null,
      transcriptTrackId: generatedTrack?.id ?? lessonEditor.lesson.transcriptTrackId ?? null,
      transcriptStatus,
    });

    return {
      muxStatus: mappedStatus,
      playbackId,
    };
  },
});
