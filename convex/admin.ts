/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  courseStatusValidator,
  courseVisibilityValidator,
  lessonStateValidator,
  muxStatusValidator,
  resourceTypeValidator,
  transcriptStatusValidator,
} from "./schema";
import { assertCanManageCourse, requireAdmin, requireAdminOrMaintainer } from "./lib/auth";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getSignedStorageUrl(ctx: any, storageId: Id<"_storage"> | null) {
  if (!storageId) return null;
  return await ctx.storage.getUrl(storageId);
}

async function ensureUniqueCourseSlug(ctx: any, desiredSlug: string, excludeCourseId?: Id<"courses">) {
  const base = slugify(desiredSlug) || `course-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await ctx.db.query("courses").withIndex("by_slug", (q: any) => q.eq("slug", candidate)).unique();
    if (!existing || existing._id === excludeCourseId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

async function ensureUniqueLessonSlug(ctx: any, courseId: Id<"courses">, desiredSlug: string, excludeLessonId?: Id<"courseLessons">) {
  const base = slugify(desiredSlug) || `lesson-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  while (true) {
    const lessons = await ctx.db
      .query("courseLessons")
      .withIndex("by_courseId_and_slug", (q: any) => q.eq("courseId", courseId).eq("slug", candidate))
      .take(5);
    const conflict = lessons.find((entry: any) => entry._id !== excludeLessonId);
    if (!conflict) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

async function createDefaultChapter(ctx: any, courseId: Id<"courses">) {
  return await ctx.db.insert("courseChapters", {
    courseId,
    title: "Curriculum",
    description: "Default chapter for this course",
    position: 0,
    isDefault: true,
  });
}

async function processQueryInBatches<T>(fetchBatch: () => Promise<T[]>, pageSize: number, processItem: (item: T) => Promise<void>) {
  while (true) {
    const batch = await fetchBatch();
    if (batch.length === 0) {
      break;
    }
    for (const item of batch) {
      await processItem(item);
    }
    if (batch.length < pageSize) {
      break;
    }
  }
}

async function syncCourseCounts(ctx: any, courseId: Id<"courses">) {
  let chapterCount = 0;
  let lessonCount = 0;

  // Count chapters in batches
  await processQueryInBatches(
    () =>
      ctx.db
        .query("courseChapters")
        .withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", courseId))
        .take(500),
    500,
    async () => {
      chapterCount += 1;
    },
  );

  // Count lessons in batches
  await processQueryInBatches(
    () =>
      ctx.db
        .query("courseLessons")
        .withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", courseId))
        .take(500),
    500,
    async () => {
      lessonCount += 1;
    },
  );

  await ctx.db.patch(courseId, {
    chapterCount,
    lessonCount,
  });
}

async function ensureOwnerAccess(ctx: any, courseId: Id<"courses">, userId: Id<"users">) {
  const existing = await ctx.db
    .query("courseAccess")
    .withIndex("by_userId_and_courseId", (q: any) => q.eq("userId", userId).eq("courseId", courseId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { accessType: "owner" });
    return;
  }

  await ctx.db.insert("courseAccess", {
    courseId,
    userId,
    accessType: "owner",
    grantedAt: Date.now(),
  });
}

export const getViewer = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireAdminOrMaintainer(ctx);
    return {
      ...viewer.user,
      role: viewer.role,
      isAdmin: viewer.isAdmin,
      isMaintainer: viewer.isMaintainer,
    };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireAdminOrMaintainer(ctx);
    const allCourses = viewer.isAdmin
      ? await Promise.all(
          ["draft", "published", "archived"].map((status) =>
            ctx.db.query("courses").withIndex("by_status", (q) => q.eq("status", status as any)).take(100),
          ),
        ).then((parts) => parts.flat())
      : await Promise.all(
          ["draft", "published", "archived"].map((status) =>
            ctx.db
              .query("courses")
              .withIndex("by_maintainerUserId_and_status", (q) => q.eq("maintainerUserId", viewer.user._id).eq("status", status as any))
              .take(100),
          ),
        ).then((parts) => parts.flat());

    const lessons = await Promise.all(
      allCourses.map((course) =>
        ctx.db.query("courseLessons").withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", course._id)).take(100),
      ),
    ).then((parts) => parts.flat());

    return {
      totalCourses: allCourses.length,
      draftCourses: allCourses.filter((course) => course.status === "draft").length,
      publishedCourses: allCourses.filter((course) => course.status === "published").length,
      archivedCourses: allCourses.filter((course) => course.status === "archived").length,
      totalLessons: lessons.length,
      processingLessons: lessons.filter((lesson) => lesson.muxStatus === "processing" || lesson.muxStatus === "uploading").length,
      erroredLessons: lessons.filter((lesson) => lesson.muxStatus === "errored").length,
      recentlyUpdated: allCourses.sort((a, b) => b._creationTime - a._creationTime).slice(0, 4),
    };
  },
});

export const listCourses = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(courseStatusValidator),
  },
  handler: async (ctx, args) => {
    const viewer = await requireAdminOrMaintainer(ctx);
    const search = args.search?.trim().toLowerCase() ?? "";
    const allCourses = viewer.isAdmin
      ? await Promise.all(
          (args.status ? [args.status] : ["draft", "published", "archived"]).map((status) =>
            ctx.db.query("courses").withIndex("by_status", (q) => q.eq("status", status as any)).take(100),
          ),
        ).then((parts) => parts.flat())
      : await Promise.all(
          (args.status ? [args.status] : ["draft", "published", "archived"]).map((status) =>
            ctx.db
              .query("courses")
              .withIndex("by_maintainerUserId_and_status", (q) => q.eq("maintainerUserId", viewer.user._id).eq("status", status as any))
              .take(100),
          ),
        ).then((parts) => parts.flat());

    const filtered = !search
      ? allCourses
      : allCourses.filter((course) =>
          [course.title, course.slug, course.description, course.tags.join(" ")].join(" ").toLowerCase().includes(search),
        );

    return await Promise.all(
      filtered
        .sort((a, b) => b._creationTime - a._creationTime)
        .map(async (course) => ({
          ...course,
          coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
        })),
    );
  },
});

export const getCourseEditor = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const { course } = await assertCanManageCourse(ctx, args.courseId);
    const [chapters, lessons] = await Promise.all([
      ctx.db.query("courseChapters").withIndex("by_courseId_and_position", (q) => q.eq("courseId", args.courseId)).take(100),
      ctx.db.query("courseLessons").withIndex("by_courseId_and_position", (q) => q.eq("courseId", args.courseId)).take(500),
    ]);

    return {
      course: {
        ...course,
        coverImageUrl: course.coverImageUrl ?? (await getSignedStorageUrl(ctx, course.coverImageStorageId)),
      },
      chapters: chapters.map((chapter) => ({
        ...chapter,
        lessons: lessons.filter((lesson) => lesson.chapterId === chapter._id),
      })),
    };
  },
});

export const getLessonEditor = query({
  args: { lessonId: v.id("courseLessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      return null;
    }

    const { course } = await assertCanManageCourse(ctx, lesson.courseId);
    const [chapter, resources] = await Promise.all([
      ctx.db.get(lesson.chapterId),
      ctx.db.query("lessonResources").withIndex("by_lessonId_and_position", (q) => q.eq("lessonId", args.lessonId)).take(50),
    ]);

    return { course, chapter, lesson, resources };
  },
});

export const createCourse = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    body: v.optional(v.string()),
    level: v.optional(v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced"), v.literal("All Levels"))),
  },
  handler: async (ctx, args) => {
    const viewer = await requireAdminOrMaintainer(ctx);
    const slug = await ensureUniqueCourseSlug(ctx, args.title);

    const courseId = await ctx.db.insert("courses", {
      slug,
      title: args.title,
      subtitle: args.subtitle ?? "",
      description: args.description ?? "",
      body: args.body ?? "",
      status: "draft",
      visibility: "private",
      coverImageStorageId: null,
      coverImageUrl: null,
      coverImageAlt: null,
      githubUrl: null,
      tags: [],
      level: args.level ?? "Beginner",
      estimatedDurationMinutes: null,
      maintainerUserId: viewer.user._id,
      defaultChapterId: null,
      lessonCount: 0,
      chapterCount: 0,
      publishedAt: null,
    });

    const defaultChapterId = await createDefaultChapter(ctx, courseId);
    await ctx.db.patch(courseId, { defaultChapterId, chapterCount: 1 });
    await ensureOwnerAccess(ctx, courseId, viewer.user._id);

    return courseId;
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    slug: v.string(),
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    body: v.string(),
    status: courseStatusValidator,
    visibility: courseVisibilityValidator,
    coverImageStorageId: v.union(v.id("_storage"), v.null()),
    coverImageUrl: v.union(v.string(), v.null()),
    coverImageAlt: v.union(v.string(), v.null()),
    githubUrl: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    level: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced"), v.literal("All Levels")),
    estimatedDurationMinutes: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const { course } = await assertCanManageCourse(ctx, args.courseId);
    const slug = await ensureUniqueCourseSlug(ctx, args.slug || args.title, course._id);

    await ctx.db.patch(args.courseId, {
      slug,
      title: args.title,
      subtitle: args.subtitle,
      description: args.description,
      body: args.body,
      status: args.status,
      visibility: args.visibility,
      coverImageStorageId: args.coverImageStorageId,
      coverImageUrl: args.coverImageUrl,
      coverImageAlt: args.coverImageAlt,
      githubUrl: args.githubUrl,
      tags: args.tags,
      level: args.level,
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      publishedAt: args.status === "published" ? course.publishedAt ?? Date.now() : args.status === "draft" ? null : course.publishedAt,
    });

    await syncCourseCounts(ctx, args.courseId);
    return await ctx.db.get(args.courseId);
  },
});

async function deleteCourseCascade(ctx: any, courseId: Id<"courses">) {
  await processQueryInBatches(
    () =>
      ctx.db
        .query("courseLessons")
        .withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", courseId))
        .take(500),
    500,
    async (lesson: any) => {
      await processQueryInBatches(
        () =>
          ctx.db
            .query("lessonResources")
            .withIndex("by_lessonId_and_position", (q: any) => q.eq("lessonId", lesson._id))
            .take(100),
        100,
        async (resource: any) => {
          await ctx.db.delete(resource._id);
        },
      );
      await ctx.db.delete(lesson._id);
    },
  );

  await processQueryInBatches(
    () =>
      ctx.db
        .query("courseChapters")
        .withIndex("by_courseId_and_position", (q: any) => q.eq("courseId", courseId))
        .take(100),
    100,
    async (chapter: any) => {
      await ctx.db.delete(chapter._id);
    },
  );

  await processQueryInBatches(
    () =>
      ctx.db
        .query("courseAccess")
        .withIndex("by_courseId_and_accessType", (q: any) => q.eq("courseId", courseId))
        .take(100),
    100,
    async (row: any) => {
      await ctx.db.delete(row._id);
    },
  );

  await processQueryInBatches(
    () =>
      ctx.db
        .query("lessonProgress")
        .withIndex("by_courseId_and_userId", (q: any) => q.eq("courseId", courseId))
        .take(500),
    500,
    async (row: any) => {
      await ctx.db.delete(row._id);
    },
  );

  await ctx.db.delete(courseId);
}

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await assertCanManageCourse(ctx, args.courseId);
    await deleteCourseCascade(ctx, args.courseId);
    return { success: true };
  },
});

export const publishCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const { course } = await assertCanManageCourse(ctx, args.courseId);
    const lessons = await ctx.db.query("courseLessons").withIndex("by_courseId_and_position", (q) => q.eq("courseId", course._id)).take(500);

    if (!course.title || !course.description) {
      throw new Error("Add a title and description before publishing.");
    }
    if (lessons.length === 0) {
      throw new Error("Add at least one lesson before publishing.");
    }
    const blockingLesson = lessons.find((lesson) => lesson.muxStatus === "processing" || lesson.muxStatus === "uploading");
    if (blockingLesson) {
      throw new Error(`Wait for "${blockingLesson.title}" to finish processing before publishing.`);
    }

    await ctx.db.patch(course._id, {
      status: "published",
      visibility: course.visibility === "private" ? "public" : course.visibility,
      publishedAt: course.publishedAt ?? Date.now(),
    });

    return await ctx.db.get(course._id);
  },
});

export const unpublishCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const { course } = await assertCanManageCourse(ctx, args.courseId);
    await ctx.db.patch(course._id, {
      status: "draft",
      publishedAt: null,
    });
    return await ctx.db.get(course._id);
  },
});

export const archiveCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const { course } = await assertCanManageCourse(ctx, args.courseId);
    await ctx.db.patch(course._id, { status: "archived" });
    return await ctx.db.get(course._id);
  },
});

export const createChapter = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertCanManageCourse(ctx, args.courseId);
    const chapters = await ctx.db
      .query("courseChapters")
      .withIndex("by_courseId_and_position", (q) => q.eq("courseId", args.courseId))
      .take(100);

    const chapterId = await ctx.db.insert("courseChapters", {
      courseId: args.courseId,
      title: args.title,
      description: args.description ?? "",
      position: chapters.length,
      isDefault: false,
    });

    await syncCourseCounts(ctx, args.courseId);
    return chapterId;
  },
});

export const updateChapter = mutation({
  args: {
    chapterId: v.id("courseChapters"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    await assertCanManageCourse(ctx, chapter.courseId);
    await ctx.db.patch(args.chapterId, { title: args.title, description: args.description });
    return await ctx.db.get(args.chapterId);
  },
});

export const deleteChapter = mutation({
  args: { chapterId: v.id("courseChapters") },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    const { course } = await assertCanManageCourse(ctx, chapter.courseId);
    if (chapter.isDefault) {
      throw new Error("The default chapter can't be deleted.");
    }

    await processQueryInBatches(
      () => ctx.db.query("courseLessons").withIndex("by_chapterId_and_position", (q) => q.eq("chapterId", chapter._id)).take(200),
      200,
      async (lesson: any) => {
        if (!course.defaultChapterId) {
          throw new Error("Course has no default chapter to migrate lessons to");
        }
        await ctx.db.patch(lesson._id, { chapterId: course.defaultChapterId });
      },
    );

    await ctx.db.delete(chapter._id);
    await syncCourseCounts(ctx, course._id);
    return { success: true };
  },
});

export const reorderChapters = mutation({
  args: {
    courseId: v.id("courses"),
    chapterIds: v.array(v.id("courseChapters")),
  },
  handler: async (ctx, args) => {
    await assertCanManageCourse(ctx, args.courseId);
    const chapters = await Promise.all(args.chapterIds.map((chapterId) => ctx.db.get(chapterId)));
    const validatedChapters = [];
    for (const chapter of chapters) {
      if (!chapter) {
        throw new Error("Chapter not found");
      }
      if (chapter.courseId !== args.courseId) {
        throw new Error("One or more chapters do not belong to this course.");
      }
      validatedChapters.push(chapter);
    }
    for (let index = 0; index < validatedChapters.length; index += 1) {
      await ctx.db.patch(validatedChapters[index]._id, { position: index });
    }
    return { success: true };
  },
});

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    chapterId: v.id("courseChapters"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await assertCanManageCourse(ctx, args.courseId);
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter || chapter.courseId !== args.courseId) {
      throw new Error("Chapter not found");
    }

    const lessons = await ctx.db
      .query("courseLessons")
      .withIndex("by_courseId_and_position", (q) => q.eq("courseId", args.courseId))
      .take(500);

    const lessonId = await ctx.db.insert("courseLessons", {
      courseId: args.courseId,
      chapterId: args.chapterId,
      slug: await ensureUniqueLessonSlug(ctx, args.courseId, args.title),
      title: args.title,
      description: "",
      body: "",
      position: lessons.length,
      state: "draft",
      visibility: "private",
      githubUrl: null,
      thumbnailTime: null,
      isOptional: false,
      prompt: null,
      tags: [],
      muxUploadId: null,
      muxAssetId: null,
      muxPlaybackId: null,
      muxStatus: "idle",
      durationSeconds: null,
      transcriptStatus: "none",
    });

    await syncCourseCounts(ctx, args.courseId);
    return lessonId;
  },
});

export const updateLesson = mutation({
  args: {
    lessonId: v.id("courseLessons"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    body: v.string(),
    state: lessonStateValidator,
    visibility: courseVisibilityValidator,
    githubUrl: v.union(v.string(), v.null()),
    thumbnailTime: v.union(v.number(), v.null()),
    isOptional: v.boolean(),
    prompt: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    chapterId: v.id("courseChapters"),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);

    // Verify chapter belongs to the same course
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error("Chapter not found");
    }
    if (chapter.courseId !== lesson.courseId) {
      throw new Error("Chapter does not belong to this course");
    }

    await ctx.db.patch(args.lessonId, {
      title: args.title,
      slug: await ensureUniqueLessonSlug(ctx, lesson.courseId, args.slug || args.title, lesson._id),
      description: args.description,
      body: args.body,
      state: args.state,
      visibility: args.visibility,
      githubUrl: args.githubUrl,
      thumbnailTime: args.thumbnailTime,
      isOptional: args.isOptional,
      prompt: args.prompt,
      tags: args.tags,
      chapterId: args.chapterId,
    });
    return await ctx.db.get(args.lessonId);
  },
});

export const deleteLesson = mutation({
  args: { lessonId: v.id("courseLessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);

    await processQueryInBatches(
      () => ctx.db.query("lessonResources").withIndex("by_lessonId_and_position", (q) => q.eq("lessonId", lesson._id)).take(100),
      100,
      async (resource: any) => {
        await ctx.db.delete(resource._id);
      },
    );
    await ctx.db.delete(lesson._id);
    await syncCourseCounts(ctx, lesson.courseId);
    return { success: true };
  },
});

export const reorderLessons = mutation({
  args: {
    courseId: v.id("courses"),
    lessonIds: v.array(v.id("courseLessons")),
  },
  handler: async (ctx, args) => {
    await assertCanManageCourse(ctx, args.courseId);
    const lessons = await Promise.all(args.lessonIds.map((lessonId) => ctx.db.get(lessonId)));
    const validatedLessons = [];
    for (const lesson of lessons) {
      if (!lesson) {
        throw new Error("Lesson not found");
      }
      if (lesson.courseId !== args.courseId) {
        throw new Error("One or more lessons do not belong to this course.");
      }
      validatedLessons.push(lesson);
    }
    for (let index = 0; index < validatedLessons.length; index += 1) {
      await ctx.db.patch(validatedLessons[index]._id, { position: index });
    }
    return { success: true };
  },
});

export const createLessonResource = mutation({
  args: {
    lessonId: v.id("courseLessons"),
    type: resourceTypeValidator,
    title: v.string(),
    storageId: v.union(v.id("_storage"), v.null()),
    url: v.union(v.string(), v.null()),
    mimeType: v.union(v.string(), v.null()),
    fileSize: v.union(v.number(), v.null()),
    metadata: v.object({
      thumbnailTime: v.optional(v.number()),
      label: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);
    const resources = await ctx.db.query("lessonResources").withIndex("by_lessonId_and_position", (q) => q.eq("lessonId", args.lessonId)).take(50);

    const resourceId = await ctx.db.insert("lessonResources", {
      lessonId: args.lessonId,
      type: args.type,
      title: args.title,
      position: resources.length,
      storageId: args.storageId,
      url: args.url,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      metadata: args.metadata,
    });

    return await ctx.db.get(resourceId);
  },
});

export const updateLessonResource = mutation({
  args: {
    resourceId: v.id("lessonResources"),
    title: v.string(),
    storageId: v.union(v.id("_storage"), v.null()),
    url: v.union(v.string(), v.null()),
    mimeType: v.union(v.string(), v.null()),
    fileSize: v.union(v.number(), v.null()),
    metadata: v.object({
      thumbnailTime: v.optional(v.number()),
      label: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    const lesson = await ctx.db.get(resource.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);
    await ctx.db.patch(args.resourceId, {
      title: args.title,
      storageId: args.storageId,
      url: args.url,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      metadata: args.metadata,
    });
    return await ctx.db.get(args.resourceId);
  },
});

export const deleteLessonResource = mutation({
  args: { resourceId: v.id("lessonResources") },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    const lesson = await ctx.db.get(resource.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);
    await ctx.db.delete(resource._id);
    return { success: true };
  },
});

export const reorderLessonResources = mutation({
  args: {
    lessonId: v.id("courseLessons"),
    resourceIds: v.array(v.id("lessonResources")),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);
    const resources = await Promise.all(args.resourceIds.map((resourceId) => ctx.db.get(resourceId)));
    const validatedResources = [];
    for (const resource of resources) {
      if (!resource) {
        throw new Error("Resource not found");
      }
      if (resource.lessonId !== args.lessonId) {
        throw new Error("One or more resources do not belong to this lesson.");
      }
      validatedResources.push(resource);
    }
    for (let index = 0; index < validatedResources.length; index += 1) {
      await ctx.db.patch(validatedResources[index]._id, { position: index });
    }
    return { success: true };
  },
});

export const generateCoverUploadUrl = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await assertCanManageCourse(ctx, args.courseId);
    return { uploadUrl: await ctx.storage.generateUploadUrl() };
  },
});

export const generateResourceUploadUrl = mutation({
  args: { lessonId: v.id("courseLessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);
    return { uploadUrl: await ctx.storage.generateUploadUrl() };
  },
});

export const attachMuxUploadToLesson = mutation({
  args: {
    lessonId: v.id("courseLessons"),
    muxUploadId: v.string(),
    assetId: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    status: muxStatusValidator,
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await assertCanManageCourse(ctx, lesson.courseId);

    await ctx.db.patch(args.lessonId, {
      muxUploadId: args.muxUploadId,
      muxAssetId: args.assetId ?? lesson.muxAssetId,
      muxPlaybackId: args.playbackId ?? lesson.muxPlaybackId,
      muxStatus: args.status,
    });

    const resources = await ctx.db.query("lessonResources").withIndex("by_lessonId_and_position", (q) => q.eq("lessonId", args.lessonId)).take(50);
    const existingVideo = resources.find((resource) => resource.type === "video");

    if (!existingVideo) {
      await ctx.db.insert("lessonResources", {
        lessonId: args.lessonId,
        type: "video",
        title: `${lesson.title} video`,
        position: resources.length,
        storageId: null,
        url: args.playbackId ? `https://stream.mux.com/${args.playbackId}.m3u8` : null,
        mimeType: "application/x-mpegURL",
        fileSize: null,
        metadata: lesson.thumbnailTime ? { thumbnailTime: lesson.thumbnailTime } : {},
      });
    } else if (args.playbackId) {
      await ctx.db.patch(existingVideo._id, {
        url: `https://stream.mux.com/${args.playbackId}.m3u8`,
      });
    }

    return await ctx.db.get(args.lessonId);
  },
});

export const updateMuxLessonStatus = internalMutation({
  args: {
    lessonId: v.id("courseLessons"),
    muxAssetId: v.union(v.string(), v.null()),
    muxPlaybackId: v.union(v.string(), v.null()),
    muxStatus: muxStatusValidator,
    durationSeconds: v.union(v.number(), v.null()),
    transcriptStatus: transcriptStatusValidator,
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      return null;
    }

    await ctx.db.patch(args.lessonId, {
      muxAssetId: args.muxAssetId,
      muxPlaybackId: args.muxPlaybackId,
      muxStatus: args.muxStatus,
      durationSeconds: args.durationSeconds,
      transcriptStatus: args.transcriptStatus,
    });

    const resources = await ctx.db.query("lessonResources").withIndex("by_lessonId_and_position", (q) => q.eq("lessonId", args.lessonId)).take(50);
    const existingVideo = resources.find((resource) => resource.type === "video");
    if (existingVideo && args.muxPlaybackId) {
      await ctx.db.patch(existingVideo._id, {
        url: `https://stream.mux.com/${args.muxPlaybackId}.m3u8`,
      });
    }

    return await ctx.db.get(args.lessonId);
  },
});

export const grantCourseAccess = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
    accessType: v.union(v.literal("owner"), v.literal("staff"), v.literal("student")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ensureOwnerAccess(ctx, args.courseId, args.userId);
    const row = await ctx.db
      .query("courseAccess")
      .withIndex("by_userId_and_courseId", (q) => q.eq("userId", args.userId).eq("courseId", args.courseId))
      .unique();
    if (!row) {
      return null;
    }
    await ctx.db.patch(row._id, {
      accessType: args.accessType,
      grantedAt: row.grantedAt ?? Date.now(),
    });
    return await ctx.db.get(row._id);
  },
});
