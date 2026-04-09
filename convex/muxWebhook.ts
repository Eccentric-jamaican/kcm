/* eslint-disable @typescript-eslint/no-explicit-any */

"use node";

import Mux from "@mux/mux-node";
import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const MAX_RETRY_ATTEMPTS = 5;
const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000];

type JsonRecord = Record<string, unknown>;

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

function asObject(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function nextRetryDelayMs(currentAttempts: number): number {
  return BACKOFF_MS[Math.min(currentAttempts, BACKOFF_MS.length - 1)];
}

async function processEventProjection(
  ctx: {
    runMutation: (ref: any, args: any) => Promise<any>;
    runAction: (ref: any, args: any) => Promise<any>;
  },
  eventDocId: Id<"muxEvents">,
  event: JsonRecord,
) {
  const eventType = asString(event.type) ?? "";
  const data = asObject(event.data);
  const objectId = asString(data?.id);

  if (!data || !objectId) {
    return;
  }

  if (eventType.startsWith("video.asset.track.")) {
    await ctx.runMutation(internal.muxSync.projectMuxEventToLessons, { eventDocId });
    const trackType = asString(data.type);
    const textSource = asString(data.text_source);
    const assetId = asString(data.asset_id);
    if (eventType.endsWith(".ready") && trackType === "text" && textSource === "generated_vod" && assetId) {
      await ctx.runAction(autoFillTranscriptsForAssetRef, {
        muxAssetId: assetId,
      });
    }
    return;
  }

  if (eventType.startsWith("video.asset.")) {
    const assetPayload: JsonRecord =
      eventType.endsWith(".deleted")
        ? {
            ...data,
            id: objectId,
            status: "deleted",
          }
        : data;
    await ctx.runMutation(internal.muxSync.upsertMuxAssetFromPayload, { asset: assetPayload });
    await ctx.runMutation(internal.muxSync.projectMuxEventToLessons, { eventDocId });
    return;
  }

  if (eventType.startsWith("video.upload.")) {
    const uploadPayload: JsonRecord =
      eventType.endsWith(".deleted")
        ? {
            ...data,
            id: objectId,
            status: "deleted",
          }
        : data;
    await ctx.runMutation(internal.muxSync.upsertMuxUploadFromPayload, { upload: uploadPayload });
    await ctx.runMutation(internal.muxSync.projectMuxEventToLessons, { eventDocId });
    return;
  }
}

type MuxProjectionState = {
  projectionStatus: string;
  projectionAttempts: number;
  nextRetryAtMs: number;
} | null;

const retryFailedProjectionRef = makeFunctionReference<"action">("muxWebhook:retryFailedProjection");
const autoFillTranscriptsForAssetRef = makeFunctionReference<"action">("videoPlayback:autoFillTranscriptsForAsset");

async function handleProjectionFailure(
  ctx: {
    runMutation: (ref: any, args: any) => Promise<any>;
    scheduler: { runAfter: (ms: number, ref: any, args: any) => Promise<any> };
  },
  eventDocId: Id<"muxEvents">,
  error: unknown,
) {
  const delayMs = nextRetryDelayMs(0);
  const failureState: MuxProjectionState = await ctx.runMutation(internal.muxSync.markMuxEventProjectionFailed, {
    eventDocId,
    errorMessage: error instanceof Error ? error.message : "Unknown mux projection error",
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryAtMs: Date.now() + delayMs,
  });

  if (!failureState || failureState.projectionStatus !== "failed") {
    return failureState;
  }

  await ctx.scheduler.runAfter(delayMs, retryFailedProjectionRef, {
    eventDocId,
  });
  return failureState;
}

export const ingestMuxWebhook = internalAction({
  args: {
    rawBody: v.string(),
    headers: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args): Promise<{
    ok: boolean;
    statusCode?: number;
    message?: string;
    duplicate?: boolean;
    eventDocId?: Id<"muxEvents">;
    projectionStatus?: string;
  }> => {
    const mux = new Mux({
      webhookSecret: requiredEnv("MUX_WEBHOOK_SECRET", process.env.MUX_WEBHOOK_SECRET),
    });

    let event: JsonRecord;
    try {
      event = mux.webhooks.unwrap(args.rawBody, normalizeHeaders(args.headers)) as unknown as JsonRecord;
    } catch {
      return {
        ok: false,
        statusCode: 401,
        message: "Invalid signature",
      };
    }

    const eventRecord: { eventDocId: Id<"muxEvents">; alreadyProcessed: boolean } = await ctx.runMutation(
      internal.muxSync.recordMuxWebhookEvent,
      {
      event,
      verified: true,
      },
    );

    if (eventRecord.alreadyProcessed) {
      return {
        ok: true,
        duplicate: true,
        eventDocId: eventRecord.eventDocId,
      };
    }

    try {
      await processEventProjection(ctx, eventRecord.eventDocId, event);
      await ctx.runMutation(internal.muxSync.markMuxEventProjectionProcessed, {
        eventDocId: eventRecord.eventDocId,
      });
      return {
        ok: true,
        duplicate: false,
        eventDocId: eventRecord.eventDocId,
      };
    } catch (error) {
      const failureState = await handleProjectionFailure(ctx, eventRecord.eventDocId, error);
      return {
        ok: false,
        duplicate: false,
        eventDocId: eventRecord.eventDocId,
        projectionStatus: failureState?.projectionStatus ?? "failed",
      };
    }
  },
});

export const retryFailedProjection = internalAction({
  args: {
    eventDocId: v.id("muxEvents"),
  },
  handler: async (ctx, args): Promise<{
    ok: boolean;
    skipped?: boolean;
    reason?: string;
    retried?: boolean;
    projectionStatus?: string;
  }> => {
    const eventDoc = await ctx.runQuery(internal.muxSync.getMuxEventById, {
      eventDocId: args.eventDocId,
    });

    if (!eventDoc) {
      return { ok: false, reason: "event_not_found" as const };
    }

    if (eventDoc.projectionStatus === "processed" || eventDoc.projectionStatus === "dead_letter") {
      return { ok: true, skipped: true, reason: "already_terminal" as const };
    }

    if (eventDoc.projectionStatus === "failed" && eventDoc.nextRetryAtMs > Date.now()) {
      const delay = eventDoc.nextRetryAtMs - Date.now();
      await ctx.scheduler.runAfter(delay, retryFailedProjectionRef, {
        eventDocId: args.eventDocId,
      });
      return { ok: true, skipped: true, reason: "not_due_yet" as const };
    }

    const event = asObject(eventDoc.raw);
    if (!event) {
      await ctx.runMutation(internal.muxSync.markMuxEventProjectionFailed, {
        eventDocId: args.eventDocId,
        errorMessage: "Invalid raw event payload",
        maxAttempts: MAX_RETRY_ATTEMPTS,
        nextRetryAtMs: Date.now() + nextRetryDelayMs(eventDoc.projectionAttempts),
      });
      return { ok: false, reason: "invalid_raw_event" as const };
    }

    try {
      await processEventProjection(ctx, args.eventDocId, event);
      await ctx.runMutation(internal.muxSync.markMuxEventProjectionProcessed, {
        eventDocId: args.eventDocId,
      });
      return { ok: true, retried: true };
    } catch (error) {
      const delayMs = nextRetryDelayMs(eventDoc.projectionAttempts);
      const failureState: MuxProjectionState = await ctx.runMutation(internal.muxSync.markMuxEventProjectionFailed, {
        eventDocId: args.eventDocId,
        errorMessage: error instanceof Error ? error.message : "Unknown mux projection error",
        maxAttempts: MAX_RETRY_ATTEMPTS,
        nextRetryAtMs: Date.now() + delayMs,
      });

      if (failureState?.projectionStatus === "failed") {
        await ctx.scheduler.runAfter(delayMs, retryFailedProjectionRef, {
          eventDocId: args.eventDocId,
        });
      }

      return {
        ok: false,
        retried: true,
        projectionStatus: failureState?.projectionStatus ?? "failed",
      };
    }
  },
});

export const retryFailedProjectionSweep = internalAction({
  args: {},
  handler: async (ctx): Promise<{ scanned: number }> => {
    const dueEvents: Array<{ _id: Id<"muxEvents"> }> = await ctx.runQuery(internal.muxSync.listDueRetryMuxEvents, {
      nowMs: Date.now(),
      limit: 25,
    });

    for (const eventDoc of dueEvents) {
      await ctx.runAction(retryFailedProjectionRef, {
        eventDocId: eventDoc._id,
      });
    }

    return {
      scanned: dueEvents.length,
    };
  },
});
