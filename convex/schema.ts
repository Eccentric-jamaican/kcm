import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const courseLevelValidator = v.union(
  v.literal("Beginner"),
  v.literal("Intermediate"),
  v.literal("Advanced"),
  v.literal("All Levels"),
);

export const courseStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const courseVisibilityValidator = v.union(
  v.literal("private"),
  v.literal("public"),
  v.literal("unlisted"),
);

export const lessonStateValidator = v.union(v.literal("draft"), v.literal("published"));

export const muxStatusValidator = v.union(
  v.literal("idle"),
  v.literal("uploading"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("errored"),
);

export const muxPlaybackPolicyValidator = v.union(
  v.literal("public"),
  v.literal("signed"),
);

export const transcriptStatusValidator = v.union(
  v.literal("none"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("errored"),
);

export const resourceTypeValidator = v.union(
  v.literal("video"),
  v.literal("file"),
  v.literal("link"),
);

export const accessTypeValidator = v.union(
  v.literal("owner"),
  v.literal("staff"),
  v.literal("student"),
);

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkSubject: v.string(),
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    onboardingCompleted: v.boolean(),
    onboardingInterests: v.array(v.string()),
    role: v.optional(v.union(v.literal("student"), v.literal("maintainer"), v.literal("admin"))),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  webinars: defineTable({
    title: v.string(),
    description: v.string(),
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    presenter: v.string(),
    duration: v.number(),
    date: v.number(),
    category: v.union(
      v.literal("Weekly Market Review"),
      v.literal("Strategy Sessions"),
      v.literal("Q&A / Ask Me Anything")
    ),
    tags: v.array(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_category_date", ["category", "date"]),

  courses: defineTable({
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
    level: courseLevelValidator,
    estimatedDurationMinutes: v.union(v.number(), v.null()),
    maintainerUserId: v.id("users"),
    defaultChapterId: v.union(v.id("courseChapters"), v.null()),
    lessonCount: v.number(),
    chapterCount: v.number(),
    publishedAt: v.union(v.number(), v.null()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_visibility_and_status", ["visibility", "status"])
    .index("by_maintainerUserId_and_status", ["maintainerUserId", "status"]),

  courseChapters: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    position: v.number(),
    isDefault: v.boolean(),
  }).index("by_courseId_and_position", ["courseId", "position"]),

  courseLessons: defineTable({
    courseId: v.id("courses"),
    chapterId: v.id("courseChapters"),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    body: v.string(),
    position: v.number(),
    state: lessonStateValidator,
    visibility: courseVisibilityValidator,
    githubUrl: v.union(v.string(), v.null()),
    thumbnailTime: v.union(v.number(), v.null()),
    isOptional: v.boolean(),
    prompt: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    muxUploadId: v.union(v.string(), v.null()),
    muxAssetId: v.union(v.string(), v.null()),
    muxPlaybackId: v.union(v.string(), v.null()),
    muxPlaybackPolicy: v.optional(muxPlaybackPolicyValidator),
    muxStatus: muxStatusValidator,
    durationSeconds: v.union(v.number(), v.null()),
    transcriptStatus: transcriptStatusValidator,
  })
    .index("by_courseId_and_position", ["courseId", "position"])
    .index("by_chapterId_and_position", ["chapterId", "position"])
    .index("by_courseId_and_slug", ["courseId", "slug"]),

  lessonResources: defineTable({
    lessonId: v.id("courseLessons"),
    type: resourceTypeValidator,
    title: v.string(),
    position: v.number(),
    storageId: v.union(v.id("_storage"), v.null()),
    url: v.union(v.string(), v.null()),
    mimeType: v.union(v.string(), v.null()),
    fileSize: v.union(v.number(), v.null()),
    metadata: v.object({
      thumbnailTime: v.optional(v.number()),
      label: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  }).index("by_lessonId_and_position", ["lessonId", "position"]),

  courseAccess: defineTable({
    courseId: v.id("courses"),
    userId: v.id("users"),
    accessType: accessTypeValidator,
    grantedAt: v.number(),
  })
    .index("by_userId_and_courseId", ["userId", "courseId"])
    .index("by_courseId_and_accessType", ["courseId", "accessType"]),

  lessonProgress: defineTable({
    lessonId: v.id("courseLessons"),
    courseId: v.id("courses"),
    userId: v.id("users"),
    completed: v.boolean(),
    completedAt: v.union(v.number(), v.null()),
    lastWatchedAt: v.union(v.number(), v.null()),
    playheadSeconds: v.union(v.number(), v.null()),
  })
    .index("by_userId_and_courseId", ["userId", "courseId"])
    .index("by_userId_and_lessonId", ["userId", "lessonId"])
    .index("by_courseId_and_userId", ["courseId", "userId"]),
});
