import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkSubject: v.string(),
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    onboardingCompleted: v.boolean(),
    onboardingInterests: v.array(v.string()),
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
});
