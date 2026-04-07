"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

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
  };
};

function getMuxAuthHeader() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    throw new Error("Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET");
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
      throw new Error("Lesson not found");
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
          playback_policy: ["public"],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Mux upload creation failed with ${response.status}`);
    }

    const payload = (await response.json()) as MuxDirectUploadResponse;
    if (!payload.data?.id || !payload.data?.url) {
      throw new Error("Mux did not return an upload id and url");
    }

    await ctx.runMutation(api.admin.attachMuxUploadToLesson, {
      lessonId: args.lessonId,
      muxUploadId: payload.data.id,
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
      throw new Error("Lesson does not have a Mux asset yet");
    }

    const response = await fetch(`https://api.mux.com/video/v1/assets/${lessonEditor.lesson.muxAssetId}`, {
      headers: {
        Authorization: getMuxAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Mux asset refresh failed with ${response.status}`);
    }

    const payload = (await response.json()) as MuxAssetResponse;
    const status = payload.data?.status;
    const playbackId = payload.data?.playback_ids?.[0]?.id ?? null;
    const mappedStatus =
      status === "ready" ? "ready" : status === "errored" ? "errored" : "processing";

    await ctx.runMutation(internal.admin.updateMuxLessonStatus, {
      lessonId: args.lessonId,
      muxAssetId: payload.data?.id ?? lessonEditor.lesson.muxAssetId,
      muxPlaybackId: playbackId,
      muxStatus: mappedStatus,
      durationSeconds: payload.data?.duration ? Math.round(payload.data.duration) : null,
      transcriptStatus: mappedStatus === "ready" ? "ready" : mappedStatus === "errored" ? "errored" : "processing",
    });

    return {
      muxStatus: mappedStatus,
      playbackId,
    };
  },
});
