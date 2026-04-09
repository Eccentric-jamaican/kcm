/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { muxProjectionStatusValidator } from "./schema";

type JsonRecord = Record<string, unknown>;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asObject(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function asPlaybackIds(value: unknown): Array<{ id: string; policy?: string }> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const playbackIds = value
    .map((entry) => {
      const row = asObject(entry);
      if (!row) return null;
      const id = asString(row.id);
      if (!id) return null;
      const policy = asString(row.policy);
      return policy ? { id, policy } : { id };
    })
    .filter((entry): entry is { id: string; policy?: string } => entry !== null);

  return playbackIds.length > 0 ? playbackIds : undefined;
}

function inferObjectTypeFromEventType(eventType: string): "asset" | "upload" | "live_stream" | null {
  if (eventType.startsWith("video.asset.")) return "asset";
  if (eventType.startsWith("video.upload.")) return "upload";
  if (eventType.startsWith("video.live_stream.")) return "live_stream";
  return null;
}

function mapAssetStatusToLesson(status: string | null): "ready" | "errored" | "processing" {
  if (status === "ready") return "ready";
  if (status === "errored" || status === "deleted") return "errored";
  return "processing";
}

function mapUploadStatusToLesson(status: string | null): "errored" | "processing" {
  if (status === "errored" || status === "cancelled") return "errored";
  return "processing";
}

function mapTrackStatusToTranscriptStatus(
  status: string | null,
): "none" | "ready" | "errored" | "processing" {
  if (!status || status === "deleted") return "none";
  if (status === "ready") return "ready";
  if (status === "errored") return "errored";
  return "processing";
}

function firstPlaybackId(playbackIds: Array<{ id: string; policy?: string }> | undefined): string | null {
  return playbackIds?.[0]?.id ?? null;
}

async function upsertVideoResourceUrl(
  ctx: any,
  lessonId: string,
  muxPlaybackId: string | null,
) {
  const resources = await ctx.db
    .query("lessonResources")
    .withIndex("by_lessonId_and_position", (q: any) => q.eq("lessonId", lessonId))
    .take(50);
  const videoResource = resources.find((resource: { type: string }) => resource.type === "video");
  if (!videoResource) {
    return;
  }

  await ctx.db.patch(videoResource._id, {
    url: muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : null,
  });
}

export const recordMuxWebhookEvent = internalMutation({
  args: {
    event: v.record(v.string(), v.any()),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const nowMs = Date.now();
    const eventType = asString(args.event.type) ?? "unknown";
    const muxEventId = asString(args.event.id);
    const eventData = asObject(args.event.data);
    const objectId = asString(eventData?.id);
    const objectType = inferObjectTypeFromEventType(eventType);

    if (muxEventId) {
      const existing = await ctx.db
        .query("muxEvents")
        .withIndex("by_mux_event_id", (q) => q.eq("muxEventId", muxEventId))
        .unique();

      if (existing) {
        return { eventDocId: existing._id, alreadyProcessed: true };
      }
    }

    const eventDocId = await ctx.db.insert("muxEvents", {
      muxEventId,
      type: eventType,
      objectType,
      objectId,
      receivedAtMs: nowMs,
      verified: args.verified,
      raw: args.event,
      projectionStatus: "pending",
      projectionAttempts: 0,
      projectionLastError: null,
      nextRetryAtMs: 0,
      projectedAtMs: null,
    });

    return { eventDocId, alreadyProcessed: false };
  },
});

export const upsertMuxAssetFromPayload = internalMutation({
  args: {
    asset: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const nowMs = Date.now();
    const muxAssetId = asString(args.asset.id);
    if (!muxAssetId) {
      throw new Error("Mux asset payload missing id");
    }

    const existing = await ctx.db
      .query("muxAssets")
      .withIndex("by_mux_asset_id", (q) => q.eq("muxAssetId", muxAssetId))
      .unique();

    const patchDoc = {
      status: asString(args.asset.status),
      playbackIds: asPlaybackIds(args.asset.playback_ids),
      durationSeconds: asNumber(args.asset.duration),
      uploadId: asString(args.asset.upload_id),
      updatedAtMs: nowMs,
      deletedAtMs: asString(args.asset.status) === "deleted" ? nowMs : null,
      raw: args.asset,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patchDoc);
      return existing._id;
    }

    return await ctx.db.insert("muxAssets", {
      muxAssetId,
      createdAtMs: nowMs,
      ...patchDoc,
    });
  },
});

export const markMuxAssetDeleted = internalMutation({
  args: {
    muxAssetId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("muxAssets")
      .withIndex("by_mux_asset_id", (q) => q.eq("muxAssetId", args.muxAssetId))
      .unique();
    if (!existing) return null;
    const nowMs = Date.now();
    await ctx.db.patch(existing._id, {
      status: "deleted",
      deletedAtMs: nowMs,
      updatedAtMs: nowMs,
    });
    return existing._id;
  },
});

export const upsertMuxUploadFromPayload = internalMutation({
  args: {
    upload: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const nowMs = Date.now();
    const muxUploadId = asString(args.upload.id);
    if (!muxUploadId) {
      throw new Error("Mux upload payload missing id");
    }

    const existing = await ctx.db
      .query("muxUploads")
      .withIndex("by_mux_upload_id", (q) => q.eq("muxUploadId", muxUploadId))
      .unique();

    const patchDoc = {
      status: asString(args.upload.status),
      uploadUrl: asString(args.upload.url),
      assetId: asString(args.upload.asset_id),
      updatedAtMs: nowMs,
      deletedAtMs: asString(args.upload.status) === "deleted" ? nowMs : null,
      raw: args.upload,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patchDoc);
      return existing._id;
    }

    return await ctx.db.insert("muxUploads", {
      muxUploadId,
      createdAtMs: nowMs,
      ...patchDoc,
    });
  },
});

export const markMuxUploadDeleted = internalMutation({
  args: {
    muxUploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("muxUploads")
      .withIndex("by_mux_upload_id", (q) => q.eq("muxUploadId", args.muxUploadId))
      .unique();
    if (!existing) return null;
    const nowMs = Date.now();
    await ctx.db.patch(existing._id, {
      status: "deleted",
      deletedAtMs: nowMs,
      updatedAtMs: nowMs,
    });
    return existing._id;
  },
});

export const markMuxEventProjectionProcessed = internalMutation({
  args: {
    eventDocId: v.id("muxEvents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventDocId, {
      projectionStatus: "processed",
      projectionLastError: null,
      projectedAtMs: Date.now(),
      nextRetryAtMs: 0,
    });
  },
});

export const markMuxEventProjectionFailed = internalMutation({
  args: {
    eventDocId: v.id("muxEvents"),
    errorMessage: v.string(),
    maxAttempts: v.number(),
    nextRetryAtMs: v.number(),
  },
  handler: async (ctx, args) => {
    const eventDoc = await ctx.db.get(args.eventDocId);
    if (!eventDoc) {
      return null;
    }

    const attempts = eventDoc.projectionAttempts + 1;
    const isDeadLetter = attempts >= args.maxAttempts;
    const projectionStatus = isDeadLetter ? "dead_letter" : "failed";

    await ctx.db.patch(args.eventDocId, {
      projectionStatus,
      projectionAttempts: attempts,
      projectionLastError: args.errorMessage,
      nextRetryAtMs: isDeadLetter ? 0 : args.nextRetryAtMs,
      projectedAtMs: isDeadLetter ? Date.now() : null,
    });

    return {
      projectionStatus,
      projectionAttempts: attempts,
      nextRetryAtMs: isDeadLetter ? 0 : args.nextRetryAtMs,
    };
  },
});

export const getMuxEventById = internalQuery({
  args: {
    eventDocId: v.id("muxEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventDocId);
  },
});

export const listDueRetryMuxEvents = internalQuery({
  args: {
    nowMs: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("muxEvents")
      .withIndex("by_projection_status_and_next_retry", (q) =>
        q.eq("projectionStatus", "failed").lte("nextRetryAtMs", args.nowMs),
      )
      .take(args.limit);
  },
});

export const projectMuxEventToLessons = internalMutation({
  args: {
    eventDocId: v.id("muxEvents"),
  },
  handler: async (ctx, args) => {
    const eventDoc = await ctx.db.get(args.eventDocId);
    if (!eventDoc) {
      throw new Error("Mux event not found");
    }

    const eventType = eventDoc.type;
    const objectId = eventDoc.objectId;
    const rawEvent = asObject(eventDoc.raw);
    const rawData = asObject(rawEvent?.data);

    if (!objectId) {
      return { projected: false, reason: "missing_object_id" as const };
    }

    if (eventType.startsWith("video.asset.track.")) {
      const trackType = asString(rawData?.type);
      const textSource = asString(rawData?.text_source);
      const trackAssetId = asString(rawData?.asset_id);

      if (trackType !== "text" || textSource !== "generated_vod" || !trackAssetId) {
        return { projected: false, reason: "unsupported_track_event" as const };
      }

      const lessons = await ctx.db
        .query("courseLessons")
        .withIndex("by_muxAssetId", (q) => q.eq("muxAssetId", trackAssetId))
        .take(50);

      const transcriptStatus = mapTrackStatusToTranscriptStatus(asString(rawData?.status));
      const transcriptTrackId = eventType.endsWith(".deleted") ? null : objectId;

      for (const lesson of lessons) {
        await ctx.db.patch(lesson._id, {
          transcriptTrackId,
          transcriptStatus,
        });
      }

      return { projected: true, projectedLessonCount: lessons.length };
    }

    if (eventType.startsWith("video.asset.")) {
      const asset = await ctx.db
        .query("muxAssets")
        .withIndex("by_mux_asset_id", (q) => q.eq("muxAssetId", objectId))
        .unique();
      if (!asset) {
        return { projected: false, reason: "asset_not_found" as const };
      }

      const byAssetLessons = await ctx.db
        .query("courseLessons")
        .withIndex("by_muxAssetId", (q) => q.eq("muxAssetId", objectId))
        .take(50);
      const byUploadLessons = asset.uploadId
        ? await ctx.db
            .query("courseLessons")
            .withIndex("by_muxUploadId", (q) => q.eq("muxUploadId", asset.uploadId))
            .take(50)
        : [];

      const lessonsById = new Map<string, (typeof byAssetLessons)[number]>();
      for (const lesson of [...byAssetLessons, ...byUploadLessons]) {
        lessonsById.set(lesson._id, lesson);
      }
      const lessons = Array.from(lessonsById.values());

      const muxStatus = mapAssetStatusToLesson(asset.status);
      const muxPlaybackId = firstPlaybackId(asset.playbackIds);
      for (const lesson of lessons) {
        const transcriptStatus =
          muxStatus === "errored"
            ? "errored"
            : lesson.transcriptStatus === "ready"
              ? "ready"
              : "processing";
        await ctx.db.patch(lesson._id, {
          muxAssetId: objectId,
          muxPlaybackId,
          muxStatus,
          durationSeconds: asset.durationSeconds,
          transcriptStatus,
        });
        await upsertVideoResourceUrl(ctx, lesson._id, muxPlaybackId);
      }

      return { projected: true, projectedLessonCount: lessons.length };
    }

    if (eventType.startsWith("video.upload.")) {
      const upload = await ctx.db
        .query("muxUploads")
        .withIndex("by_mux_upload_id", (q) => q.eq("muxUploadId", objectId))
        .unique();
      if (!upload) {
        return { projected: false, reason: "upload_not_found" as const };
      }

      const lessons = await ctx.db
        .query("courseLessons")
        .withIndex("by_muxUploadId", (q) => q.eq("muxUploadId", objectId))
        .take(50);

      const muxStatus = mapUploadStatusToLesson(upload.status);
      const linkedAsset = upload.assetId
        ? await ctx.db
            .query("muxAssets")
            .withIndex("by_mux_asset_id", (q) => q.eq("muxAssetId", upload.assetId!))
            .unique()
        : null;

      const linkedPlaybackId = firstPlaybackId(linkedAsset?.playbackIds);
      const linkedAssetMuxStatus = linkedAsset ? mapAssetStatusToLesson(linkedAsset.status) : null;

      for (const lesson of lessons) {
        const effectiveMuxStatus = linkedAssetMuxStatus ?? muxStatus;
        const effectiveTranscriptStatus =
          effectiveMuxStatus === "errored"
            ? "errored"
            : lesson.transcriptStatus === "ready"
              ? "ready"
              : "processing";
        const effectiveDuration = linkedAsset?.durationSeconds ?? lesson.durationSeconds;
        const effectivePlaybackId = linkedPlaybackId ?? lesson.muxPlaybackId;

        await ctx.db.patch(lesson._id, {
          muxAssetId: upload.assetId ?? lesson.muxAssetId,
          muxPlaybackId: effectivePlaybackId,
          muxStatus: effectiveMuxStatus,
          durationSeconds: effectiveDuration,
          transcriptStatus: effectiveTranscriptStatus,
        });
        await upsertVideoResourceUrl(ctx, lesson._id, effectivePlaybackId);
      }

      return { projected: true, projectedLessonCount: lessons.length };
    }

    return { projected: false, reason: "unsupported_event" as const };
  },
});

export const setMuxEventProjectionStatus = internalMutation({
  args: {
    eventDocId: v.id("muxEvents"),
    projectionStatus: muxProjectionStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventDocId, { projectionStatus: args.projectionStatus });
  },
});
