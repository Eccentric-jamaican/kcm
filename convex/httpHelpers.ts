/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const findLessonByMuxUploadId = internalQuery({
  args: {
    muxUploadId: v.string(),
  },
  handler: async (ctx, args) => {
    const courseSets = await Promise.all(
      ["draft", "published", "archived"].map((status) =>
        ctx.db.query("courses").withIndex("by_status", (q) => q.eq("status", status as any)).take(100),
      ),
    );
    const courses = courseSets.flat();

    for (const course of courses) {
      const lessons = await ctx.db
        .query("courseLessons")
        .withIndex("by_courseId_and_position", (q) => q.eq("courseId", course._id))
        .take(500);
      const match = lessons.find((lesson) => lesson.muxUploadId === args.muxUploadId);
      if (match) {
        return { lessonId: match._id };
      }
    }

    return null;
  },
});
