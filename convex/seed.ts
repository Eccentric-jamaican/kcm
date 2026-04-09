import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { seedCourses } from "./lib/courseSeedData";

const sampleWebinars = [
  {
    title: "USD/JPY Breakout Analysis - January 2025",
    description:
      "In-depth analysis of the USD/JPY breakout patterns, key support and resistance levels, and trading opportunities for the upcoming week. We covered entry signals, risk management, and profit targets.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&q=80",
    presenter: "KCM Team",
    duration: 45,
    date: new Date("2025-01-15T18:00:00Z").getTime(),
    category: "Weekly Market Review" as const,
    tags: ["USD/JPY", "Forex", "Breakout", "Technical Analysis"],
  },
  {
    title: "ICT Fair Value Gap Strategy Explained",
    description:
      "A comprehensive breakdown of the Fair Value Gap concept from ICT. Learn how to identify valid FVGs, when to enter, and how to manage trades using this powerful smart money concept.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
    presenter: "Antonio",
    duration: 62,
    date: new Date("2025-02-03T19:00:00Z").getTime(),
    category: "Strategy Sessions" as const,
    tags: ["ICT", "Fair Value Gap", "Smart Money", "Advanced"],
  },
];

export const seedWebinars = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("webinars").take(1);
    if (existing.length > 0) {
      return { seeded: false, message: "Webinars already exist" };
    }

    for (const webinar of sampleWebinars) {
      await ctx.db.insert("webinars", webinar);
    }

    return { seeded: true, count: sampleWebinars.length };
  },
});

export const seedCoursesAndLessons = mutation({
  args: {
    maintainerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("courses").take(1);
    if (existing.length > 0) {
      return { seeded: false, message: "Courses already exist" };
    }

    for (const seedCourse of seedCourses) {
      const courseId = await ctx.db.insert("courses", {
        slug: seedCourse.slug,
        title: seedCourse.title,
        subtitle: seedCourse.subtitle,
        description: seedCourse.description,
        body: seedCourse.body,
        status: "published",
        visibility: "public",
        coverImageStorageId: null,
        coverImageUrl: seedCourse.coverImageUrl,
        coverImageAlt: seedCourse.title,
        githubUrl: null,
        tags: seedCourse.tags,
        level: seedCourse.level,
        estimatedDurationMinutes: seedCourse.estimatedDurationMinutes,
        maintainerUserId: args.maintainerUserId,
        defaultChapterId: null,
        lessonCount: seedCourse.lessons.length,
        chapterCount: 1,
        publishedAt: Date.now(),
      });

      const chapterId = await ctx.db.insert("courseChapters", {
        courseId,
        title: "Curriculum",
        description: "Imported course outline",
        position: 0,
        isDefault: true,
      });

      await ctx.db.patch(courseId, { defaultChapterId: chapterId });

      await ctx.db.insert("courseAccess", {
        courseId,
        userId: args.maintainerUserId,
        accessType: "owner",
        grantedAt: Date.now(),
      });

      for (let index = 0; index < seedCourse.lessons.length; index += 1) {
        const lesson = seedCourse.lessons[index];
        await ctx.db.insert("courseLessons", {
          courseId,
          chapterId,
          slug: lesson.slug,
          title: lesson.title,
          description: lesson.description,
          body: lesson.body,
          position: index,
          state: "published",
          visibility: "public",
          githubUrl: null,
          thumbnailTime: null,
          isOptional: false,
          prompt: null,
          tags: seedCourse.tags,
          muxUploadId: null,
          muxAssetId: null,
          muxPlaybackId: null,
          muxStatus: "idle",
          durationSeconds: lesson.durationMinutes * 60,
          transcriptTrackId: null,
          transcriptStatus: "none",
        });
      }
    }

    return { seeded: true, count: seedCourses.length };
  },
});
