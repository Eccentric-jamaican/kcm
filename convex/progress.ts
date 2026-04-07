import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireViewer } from "./lib/auth";

export const getCourseProgress = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    return await ctx.db
      .query("lessonProgress")
      .withIndex("by_userId_and_courseId", (q) => q.eq("userId", viewer.user._id).eq("courseId", args.courseId))
      .take(500);
  },
});

export const markLessonComplete = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.id("courseLessons"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_userId_and_lessonId", (q) => q.eq("userId", viewer.user._id).eq("lessonId", args.lessonId))
      .unique();

    const patch = {
      courseId: args.courseId,
      lessonId: args.lessonId,
      userId: viewer.user._id,
      completed: args.completed,
      completedAt: args.completed ? Date.now() : null,
      lastWatchedAt: Date.now(),
      playheadSeconds: existing?.playheadSeconds ?? null,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return await ctx.db.get(existing._id);
    }

    const progressId = await ctx.db.insert("lessonProgress", patch);
    return await ctx.db.get(progressId);
  },
});

export const saveLessonPlayback = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.id("courseLessons"),
    playheadSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_userId_and_lessonId", (q) => q.eq("userId", viewer.user._id).eq("lessonId", args.lessonId))
      .unique();

    const patch = {
      courseId: args.courseId,
      lessonId: args.lessonId,
      userId: viewer.user._id,
      completed: existing?.completed ?? false,
      completedAt: existing?.completedAt ?? null,
      lastWatchedAt: Date.now(),
      playheadSeconds: args.playheadSeconds,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return await ctx.db.get(existing._id);
    }

    const progressId = await ctx.db.insert("lessonProgress", patch);
    return await ctx.db.get(progressId);
  },
});
