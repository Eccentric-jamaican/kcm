import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();
const MUX_SIGNATURE_TOLERANCE_SEC = 300;

async function verifyMuxSignature(signatureHeader: string | null, body: string) {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }
  if (!signatureHeader) {
    return false;
  }

  const entries = signatureHeader.split(",").map((part) => part.trim().split("="));
  const values = Object.fromEntries(entries);
  const timestamp = values.t;
  const signature = values.v1;

  if (!timestamp || !signature) {
    return false;
  }
  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || !Number.isInteger(ts)) {
    return false;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - ts) > MUX_SIGNATURE_TOLERANCE_SEC) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`));
  const computed = Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

http.route({
  path: "/mux/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    const signature = request.headers.get("mux-signature");

    if (!(await verifyMuxSignature(signature, rawBody))) {
      return new Response("Invalid signature", { status: 401 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody) as {
        type?: string;
        data?: {
          upload_id?: string;
          id?: string;
          playback_ids?: Array<{ id: string }>;
          duration?: number;
          tracks?: Array<{
            type?: string;
            text_source?: string;
            status?: string;
          }>;
        };
      };
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError);
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const uploadId = payload.data?.upload_id;
    if (!uploadId) {
      return new Response("Ignored", { status: 200 });
    }

    const lessonRecord = await ctx.runQuery(internal.httpHelpers.findLessonByMuxUploadId, {
      muxUploadId: uploadId,
    });

    if (!lessonRecord?.lessonId) {
      return new Response("No lesson for upload", { status: 200 });
    }

    const isAssetEvent = payload.type === "video.asset.ready" || payload.type === "video.asset.errored";
    const playbackId = payload.data?.playback_ids?.[0]?.id ?? null;
    const muxStatus = payload.type === "video.asset.ready" ? "ready" : payload.type === "video.asset.errored" ? "errored" : undefined;

    // Only set transcriptStatus for explicit track events; leave it
    // undefined for asset-level events so we don't regress an existing value.
    let transcriptStatus: "none" | "processing" | "ready" | "errored" | undefined;
    if (payload.type === "video.asset.track.ready") {
      const track = payload.data?.tracks?.[0];
      if (track?.text_source === "generated_vod") {
        transcriptStatus = "ready";
      }
    } else if (payload.type === "video.asset.track.errored") {
      const track = payload.data?.tracks?.[0];
      if (track?.text_source === "generated_vod") {
        transcriptStatus = "errored";
      }
    }

    const mutationArgs: {
      lessonId: typeof lessonRecord.lessonId;
      muxAssetId?: string | null;
      muxPlaybackId?: string | null;
      muxStatus?: "ready" | "errored";
      durationSeconds?: number | null;
      transcriptStatus?: "none" | "processing" | "ready" | "errored";
    } = {
      lessonId: lessonRecord.lessonId,
      ...(transcriptStatus !== undefined ? { transcriptStatus } : {}),
      ...(isAssetEvent
        ? {
            muxAssetId: payload.data?.id ?? null,
            muxPlaybackId: playbackId,
            muxStatus,
            durationSeconds: typeof payload.data?.duration === "number" ? Math.round(payload.data.duration) : null,
          }
        : {}),
    };

    if (isAssetEvent || transcriptStatus !== undefined) {
      await ctx.runMutation(internal.admin.updateMuxLessonStatus, mutationArgs);
    }

    return new Response("ok", { status: 200 });
  }),
});

export default http;
