"use node";

import { importPKCS8, SignJWT } from "jose";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

function getSigningEnv() {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const privateKey = process.env.MUX_SIGNING_PRIVATE_KEY;

  if (!keyId || !privateKey) {
    throw new Error("Missing MUX_SIGNING_KEY_ID or MUX_SIGNING_PRIVATE_KEY");
  }

  return {
    keyId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
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
      throw new Error("Lesson video is not ready for playback");
    }

    const { keyId, privateKey } = getSigningEnv();
    const privateCryptoKey = await importPKCS8(privateKey, "RS256");
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = Math.max(
      nowSeconds + 60 * 10,
      nowSeconds + (playbackDetails.lesson.durationSeconds ?? 0) + 60 * 15,
    );

    // Authorize first, sign second. The internal query above verifies the
    // current viewer is entitled to this paid course before we mint anything.
    // Mux expects the playback token subject to be the playback ID and the
    // audience to be the video playback audience ("v").
    const playbackToken = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256", kid: keyId })
      .setIssuedAt(nowSeconds)
      .setNotBefore(nowSeconds)
      .setExpirationTime(expiresAtSeconds)
      .setAudience("v")
      .setSubject(playbackDetails.lesson.muxPlaybackId)
      .sign(privateCryptoKey);

    return {
      playbackId: playbackDetails.lesson.muxPlaybackId,
      playbackToken,
      thumbnailToken: null,
      expiresAt: expiresAtSeconds * 1000,
    };
  },
});
