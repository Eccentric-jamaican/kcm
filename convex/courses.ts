/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { requireCoursePlaybackAccess, requireViewer } from "./lib/auth";
import { throwAppError } from "./lib/errors";

async function getSignedStorageUrl(ctx: any, storageId: any) {
  if (!storageId) {
    return null;
  }
  return await ctx.storage.getUrl(storageId);
}

async function loadCourseChapters(ctx: any, courseId: any) {
  return await ctx.db
    .query("courseChapters")
    .withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", courseId))
    .take(100);
}

async function loadCourseLessons(ctx: any, courseId: any) {
  return await ctx.db
    .query("courseLessons")
    .withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", courseId))
    .take(500);
}

async function loadLessonResources(ctx: any, lessonIds: string[]) {
  const results = await Promise.all(
    lessonIds.map(async (lessonId) => {
      const resources = await ctx.db
        .query("lessonResources")
        .withIndex("by_lessonId_and_position", (q: any) => q.eq("lessonId", lessonId))
        .take(50);
      return [lessonId, resources] as const;
    }),
  );

  return Object.fromEntries(results);
}

function groupLessonsByChapter(chapters: any[], lessons: any[]) {
  return chapters.map((chapter) => ({
    ...chapter,
    lessons: lessons.filter((lesson) => lesson.chapterId === chapter._id),
  }));
}

async function ensureViewerCanReadPublishedCourse(ctx: any, course: any) {
  if (course.visibility === "public") {
    return null;
  }

  return await requireCoursePlaybackAccess(ctx, course._id);
}

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_visibility_and_status", (q) => q.eq("visibility", "public").eq("status", "published"))
      .take(50);

    return await Promise.all(
      courses.map(async (course) => ({
        ...course,
        coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
      })),
    );
  },
});

export const getPublishedCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course || course.status !== "published" || course.visibility !== "public") {
      return null;
    }

    const [chapters, lessons] = await Promise.all([
      loadCourseChapters(ctx, course._id),
      loadCourseLessons(ctx, course._id),
    ]);

    return {
      course: {
        ...course,
        coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
      },
      chapters: groupLessonsByChapter(chapters, lessons),
      lessons,
      firstLessonSlug: lessons[0]?.slug ?? null,
    };
  },
});

export const getPublishedLessonBySlug = query({
  args: {
    courseSlug: v.string(),
    lessonSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.courseSlug))
      .unique();

    if (!course || course.status !== "published" || course.visibility !== "public") {
      return null;
    }

    const lessons = await loadCourseLessons(ctx, course._id);
    const lesson = lessons.find((entry: (typeof lessons)[number]) => entry.slug === args.lessonSlug);

    if (!lesson || lesson.state !== "published") {
      return null;
    }

    const lessonResources = await loadLessonResources(
      ctx,
      lessons.map((entry: (typeof lessons)[number]) => entry._id),
    );

    const chapters = await loadCourseChapters(ctx, course._id);
    const currentIndex = lessons.findIndex((entry: (typeof lessons)[number]) => entry._id === lesson._id);
    let progress = null;

    try {
      const viewer = await requireViewer(ctx);
      progress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_userId_and_lessonId", (q) => q.eq("userId", viewer.user._id).eq("lessonId", lesson._id))
        .unique();
    } catch {
      progress = null;
    }

    return {
      course: {
        ...course,
        coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
      },
      lesson,
      chapters: groupLessonsByChapter(chapters, lessons),
      navigation: {
        previousLesson: currentIndex > 0 ? lessons[currentIndex - 1] : null,
        nextLesson: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
      },
      resources: lessonResources[lesson._id] ?? [],
      progress,
    };
  },
});

export const getCourseBySlugForViewer = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course || course.status !== "published") {
      return null;
    }

    await ensureViewerCanReadPublishedCourse(ctx, course);

    const [chapters, lessons] = await Promise.all([
      loadCourseChapters(ctx, course._id),
      loadCourseLessons(ctx, course._id),
    ]);

    return {
      course: {
        ...course,
        coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
      },
      chapters: groupLessonsByChapter(chapters, lessons),
      lessons,
      firstLessonSlug: lessons[0]?.slug ?? null,
    };
  },
});

export const getLessonBySlugForViewer = query({
  args: {
    courseSlug: v.string(),
    lessonSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.courseSlug))
      .unique();

    if (!course || course.status !== "published") {
      return null;
    }

    await ensureViewerCanReadPublishedCourse(ctx, course);

    const lessons = await loadCourseLessons(ctx, course._id);
    const lesson = lessons.find((entry: (typeof lessons)[number]) => entry.slug === args.lessonSlug);

    if (!lesson || lesson.state !== "published") {
      return null;
    }

    const lessonResources = await loadLessonResources(
      ctx,
      lessons.map((entry: (typeof lessons)[number]) => entry._id),
    );

    const chapters = await loadCourseChapters(ctx, course._id);
    const currentIndex = lessons.findIndex((entry: (typeof lessons)[number]) => entry._id === lesson._id);
    let progress = null;

    try {
      const viewer = await requireViewer(ctx);
      progress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_userId_and_lessonId", (q) => q.eq("userId", viewer.user._id).eq("lessonId", lesson._id))
        .unique();
    } catch {
      progress = null;
    }

    return {
      course: {
        ...course,
        coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
      },
      lesson,
      chapters: groupLessonsByChapter(chapters, lessons),
      navigation: {
        previousLesson: currentIndex > 0 ? lessons[currentIndex - 1] : null,
        nextLesson: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
      },
      resources: lessonResources[lesson._id] ?? [],
      progress,
    };
  },
});

export const getLessonPlaybackDetails = internalQuery({
  args: {
    lessonId: v.id("courseLessons"),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throwAppError("lesson_not_found", "This lesson could not be found.");
    }

    const { course } = await requireCoursePlaybackAccess(ctx, lesson.courseId);

    if (course.status !== "published") {
      throwAppError("lesson_not_published", "This lesson is not available right now.");
    }

    if (lesson.state !== "published") {
      throwAppError("lesson_not_published", "This lesson is not available right now.");
    }

    return {
      course,
      lesson,
    };
  },
});

export const getCourseNavigation = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const [course, chapters, lessons] = await Promise.all([
      ctx.db.get(args.courseId),
      loadCourseChapters(ctx, args.courseId),
      loadCourseLessons(ctx, args.courseId),
    ]);

    if (!course) {
      return null;
    }

    return {
      course,
      chapters: groupLessonsByChapter(chapters, lessons),
    };
  },
});

export const listLessonsByMuxAssetId = internalQuery({
  args: {
    muxAssetId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courseLessons")
      .withIndex("by_muxAssetId", (q) => q.eq("muxAssetId", args.muxAssetId))
      .take(50);
  },
});
