"use node";

import { createPrivateKey } from "node:crypto";
import { importPKCS8, SignJWT } from "jose";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { throwAppError } from "./lib/errors";

function looksLikeBase64(value: string) {
  return /^[A-Za-z0-9+/=]+$/.test(value) && value.length % 4 === 0;
}

function normalizePem(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("-----BEGIN")) {
    return trimmed.replace(/\\n/g, "\n");
  }

  if (looksLikeBase64(trimmed)) {
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf8").trim();
      if (decoded.includes("-----BEGIN")) {
        return decoded.replace(/\\n/g, "\n");
      }
    } catch {
      // no-op; validated below
    }
  }

  return trimmed.replace(/\\n/g, "\n");
}

function ensurePkcs8Pem(value: string): string {
  const normalized = normalizePem(value);
  if (normalized.includes("-----BEGIN PRIVATE KEY-----")) {
    return normalized;
  }

  if (normalized.includes("-----BEGIN RSA PRIVATE KEY-----")) {
    const pkcs8 = createPrivateKey(normalized).export({
      type: "pkcs8",
      format: "pem",
    });
    return pkcs8.toString();
  }

  throw new Error(
    "MUX_SIGNING_PRIVATE_KEY must be a PEM private key (PKCS#8 preferred).",
  );
}

function getSigningEnv() {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const privateKey = process.env.MUX_SIGNING_PRIVATE_KEY;

  if (!keyId || !privateKey) {
    throwAppError(
      "playback_unavailable",
      "Private video playback is temporarily unavailable. Please try again shortly.",
      { retryable: true },
    );
  }

  try {
    return {
      keyId,
      privateKey: ensurePkcs8Pem(privateKey),
    };
  } catch (error) {
    console.error("Invalid Mux signing key configuration", error);
    throwAppError(
      "playback_unavailable",
      "Private video playback is temporarily unavailable. Please try again shortly.",
      { retryable: true },
    );
  }
}

async function createMuxPlaybackToken(params: {
  keyId: string;
  privateKey: string;
  playbackId: string;
  durationSeconds: number | null;
}) {
  const privateCryptoKey = await importPKCS8(params.privateKey, "RS256");
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = Math.max(
    nowSeconds + 60 * 10,
    nowSeconds + (params.durationSeconds ?? 0) + 60 * 15,
  );

  const playbackToken = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: params.keyId })
    .setIssuedAt(nowSeconds)
    .setNotBefore(nowSeconds)
    .setExpirationTime(expiresAtSeconds)
    .setAudience("v")
    .setSubject(params.playbackId)
    .sign(privateCryptoKey);

  return {
    playbackToken,
    expiresAt: expiresAtSeconds * 1000,
  };
}

function parseTimestampToSeconds(value: string): number {
  const normalized = value.replace(",", ".");
  const parts = normalized.split(":");
  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}

function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function vttToLessonBody(vttText: string): string {
  const normalized = vttText.replace(/\r/g, "");
  const chunks = normalized
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const lines: string[] = [];
  for (const chunk of chunks) {
    if (chunk.startsWith("WEBVTT")) continue;
    const chunkLines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (chunkLines.length === 0) continue;

    const timeLineIndex = chunkLines.findIndex((line) => line.includes("-->"));
    if (timeLineIndex === -1) continue;

    const [startRaw] = chunkLines[timeLineIndex].split("-->");
    const startSeconds = parseTimestampToSeconds(startRaw.trim().split(" ")[0]);
    const text = chunkLines
      .slice(timeLineIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) continue;
    lines.push(`[${formatTimestamp(startSeconds)}] ${text}`);
  }

  return lines.join("\n\n");
}

export const getSignedPlaybackToken = action({
  args: {
    lessonId: v.id("courseLessons"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    playbackId: string;
    playbackToken: string;
    thumbnailToken: null;
    expiresAt: number;
  }> => {
    // This action must remain server-only because it uses the Mux signing
    // private key. The browser only ever receives a short-lived JWT.
    const playbackDetails: {
      course: { status: string };
      lesson: { muxPlaybackId: string | null; durationSeconds: number | null };
    } = await ctx.runQuery(internal.courses.getLessonPlaybackDetails, {
      lessonId: args.lessonId,
    });

    if (!playbackDetails.lesson.muxPlaybackId) {
      throwAppError(
        "lesson_video_not_ready",
        "This lesson video is still being prepared. Please check back in a bit.",
      );
    }

    const { keyId, privateKey } = getSigningEnv();
    // Authorize first, sign second. The internal query above verifies the
    // current viewer is entitled to this paid course before we mint anything.
    // Mux expects the playback token subject to be the playback ID and the
    // audience to be the video playback audience ("v").
    const { playbackToken, expiresAt } = await createMuxPlaybackToken({
      keyId,
      privateKey,
      playbackId: playbackDetails.lesson.muxPlaybackId,
      durationSeconds: playbackDetails.lesson.durationSeconds,
    });

    return {
      playbackId: playbackDetails.lesson.muxPlaybackId,
      playbackToken,
      thumbnailToken: null,
      expiresAt,
    };
  },
});

export const getSignedTranscriptVtt = action({
  args: {
    lessonId: v.id("courseLessons"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    playbackId: string;
    transcriptTrackId: string;
    transcriptVtt: string;
    expiresAt: number;
  }> => {
    const playbackDetails = await ctx.runQuery(internal.courses.getLessonPlaybackDetails, {
      lessonId: args.lessonId,
    });

    if (!playbackDetails.lesson.muxPlaybackId) {
      throwAppError(
        "lesson_video_not_ready",
        "This lesson video is still being prepared. Please check back in a bit.",
      );
    }

    if (!playbackDetails.lesson.transcriptTrackId || playbackDetails.lesson.transcriptStatus !== "ready") {
      throwAppError(
        "transcript_not_ready",
        "The transcript is still being prepared. Please check back in a bit.",
      );
    }

    const { keyId, privateKey } = getSigningEnv();
    const { playbackToken, expiresAt } = await createMuxPlaybackToken({
      keyId,
      privateKey,
      playbackId: playbackDetails.lesson.muxPlaybackId,
      durationSeconds: playbackDetails.lesson.durationSeconds,
    });

    const transcriptUrl = `https://stream.mux.com/${playbackDetails.lesson.muxPlaybackId}/text/${playbackDetails.lesson.transcriptTrackId}.vtt?token=${encodeURIComponent(playbackToken)}`;
    const transcriptResponse = await fetch(transcriptUrl);

    if (!transcriptResponse.ok) {
      console.error("Failed to fetch signed transcript VTT", {
        lessonId: args.lessonId,
        status: transcriptResponse.status,
      });
      throwAppError(
        "transcript_unavailable",
        "The transcript isn't available right now. Please try again later.",
        { retryable: true },
      );
    }

    return {
      playbackId: playbackDetails.lesson.muxPlaybackId,
      transcriptTrackId: playbackDetails.lesson.transcriptTrackId,
      transcriptVtt: await transcriptResponse.text(),
      expiresAt,
    };
  },
});

export const autoFillTranscriptsForAsset = internalAction({
  args: {
    muxAssetId: v.string(),
  },
  handler: async (ctx, args): Promise<{ scanned: number; updatedCount: number }> => {
    const lessons: Array<{
      _id: Id<"courseLessons">;
      body: string;
      muxPlaybackId: string | null;
      transcriptTrackId?: string | null;
      transcriptStatus: "none" | "processing" | "ready" | "errored";
      durationSeconds: number | null;
    }> = await ctx.runQuery(internal.courses.listLessonsByMuxAssetId, {
      muxAssetId: args.muxAssetId,
    });

    const { keyId, privateKey } = getSigningEnv();
    let updatedCount = 0;

    for (const lesson of lessons) {
      if (!lesson.muxPlaybackId || !lesson.transcriptTrackId || lesson.transcriptStatus !== "ready") {
        continue;
      }

      const { playbackToken } = await createMuxPlaybackToken({
        keyId,
        privateKey,
        playbackId: lesson.muxPlaybackId,
        durationSeconds: lesson.durationSeconds,
      });

      const transcriptUrl = `https://stream.mux.com/${lesson.muxPlaybackId}/text/${lesson.transcriptTrackId}.vtt?token=${encodeURIComponent(playbackToken)}`;
      const transcriptResponse = await fetch(transcriptUrl);
      if (!transcriptResponse.ok) {
        continue;
      }

      const vtt = await transcriptResponse.text();
      const generatedBody = vttToLessonBody(vtt);
      if (!generatedBody.trim()) {
        continue;
      }

      const result = await ctx.runMutation(internal.admin.setLessonBodyFromGeneratedTranscriptIfEmpty, {
        lessonId: lesson._id,
        body: generatedBody,
      });
      if (result?.updated) {
        updatedCount += 1;
      }
    }

    return {
      scanned: lessons.length,
      updatedCount,
    };
  },
});
